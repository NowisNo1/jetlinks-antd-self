import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Dispatch, ConnectState } from '@/models/connect';
import { Settings } from '@ant-design/pro-layout';
import { Spin, Avatar } from 'antd';
import style from './index.less';
import Service from './service';
import { router } from 'umi';
import { getQueryString } from '@/utils/tools';
import apis from '@/services';
import { getAccessToken } from '@/utils/authority';

interface Props {
  dispatch: Dispatch;
  settings: Settings;
  location: any;
}

const Login: React.FC<Props> = props => {
  const { dispatch, settings, location: { query } } = props;
  const token = getAccessToken();
  const service = new Service('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [expires, setExpires] = useState<number>(3600000);
  const [isReady, setIsReady] = useState(false);
  const [captcha, setCaptcha] = useState<string>('');
  const [captchaImg, setCaptchaImg] = useState<string>('');
  const [code, setCode] = useState<string>("");
  const [enable, setEnable] = useState<boolean>(false);
  const [current, setCurrent] = useState<boolean>(false);

  const handleSubmit = () => {
    dispatch({
      type: 'login/login',
      payload: {
        username,
        password,
        expires,
        tokenType: 'default',
        verifyKey: captcha,
        verifyCode: code,
        bindCode: query?.code
      },
      callback: () => { getCodeImg() }
    });
  };

  const getCodeImg = () => {
    if (enable) {

      // Start the runtime

      service.getCaptcha().subscribe((resp) => {
        setCaptcha(resp.key);
        setCaptchaImg(resp.base64);
      });
    }
  }

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'settings/fetchConfig',
        callback: () => {
          const title = document.getElementById('sys-title');
          const icon = document.getElementById('title-icon');
          if (title && settings.title) {
            title.textContent = settings.title;
          }
          if (icon && settings.titleIcon) {
            icon.href = settings.titleIcon;
          }
          if (token!=='null') {
            service.queryCurrent().subscribe((resp) => {
              if (resp.status === 200) {
                setCurrent(true)
              } else {
                setCurrent(false)
              }
              setIsReady(true);
            })
          } else {
            setIsReady(true);
          }
        }
      });
    }

    //???????????????????????????
    service.captchaConfig().subscribe((resp) => {
      if (resp) {
        setEnable(resp.enabled)
        if (resp.enabled) {
          //???????????????
          service.getCaptcha().subscribe((resp) => {
            setCaptcha(resp.key);
            setCaptchaImg(resp.base64);
          });
          // getCodeImg();
        } else {
          //??????????????????
        }
      }
    });



  }, [settings.title]);

  const Login = () => {
    const information = JSON.parse(localStorage.getItem('user-detail') || '{}');
    if (current) {
      return (
        <div className={style.login}>
          <div className={style.bg1} />
          <div className={style.gyl}>
            ???????????????
        <div className={style.gy2}>MQTT TCP CoAP HTTP , ????????????????????? , ?????????????????????
        </div>
          </div>
          <div className={style.box}>
            <div className={style.box1} >
              <div style={{ width: '100%', height: '30px' }}></div>
              <div className={style.avatar}>
                <Avatar size="small" className={style.avatarx} src={information.avatar || 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3273016457,3482023254&fm=26&gp=0.jpg'} alt="avatar" />
              </div>
              <input
                onClick={() => {
                  let result = getQueryString(window.location.hash);
                  if (result &&
                    result.client_id !== undefined &&
                    result.response_type !== undefined &&
                    result.redirect_uri !== undefined &&
                    result.state !== undefined
                  ) {
                    apis.login.oauth(result).then(res => {
                      if (res.status === 200) {
                        window.location.href = res.result;
                      }
                    });
                  } else {
                    router.replace('/');
                  }
                }}
                className={style.btn}
                type="button"
                name="??????"
                value="??????"
              />
              <div style={{ width: '100%', height: '30px' }}></div>
              <input
                onClick={() => {
                  localStorage.setItem('x-access-token', '');
                  setCurrent(false)
                  if (window.location.pathname !== '/user/login') {
                    router.replace({
                      pathname: '/user/login'
                    });
                  } else {
                    router.push('/user/login');
                  }
                }}
                className={style.btn}
                type="button"
                name="????????????"
                value="????????????"
              />
              <div style={{ width: '100%', height: '30px' }}></div>
            </div>
          </div>
        </div>
      )
    } else {
      return renderLogin()
    }
  }
  const renderLogin = () => (
    <div className={style.login}>

      <div className={style.bg1} />
      <div className={style.gyl}>
        ???????????????
        <div className={style.gy2}>MQTT TCP CoAP HTTP , ????????????????????? , ?????????????????????
        </div>
      </div>
      {/* style={{ height: enable ? '387px' : '330px' }} */}
      <div className={style.box}>
        <div className={style.box1} >
          <div className={style.header}>????????????</div>

          <div className={style.item}>
            <div className={style.userLabel}>?????????</div>
            <input
              style={{ borderStyle: 'none none solid none' }}
              onChange={e => setUsername(e.target.value)}
              value={username}
              type="text"
            />
          </div>
          <div className={style.item} onKeyUp={e => { if (e.keyCode === 13 && !enable) { handleSubmit(); } }}>
            <div className={style.userLabel}>
              ???<span style={{ marginLeft: '1em' }} />???
            </div>
            <input
              style={{ borderStyle: 'none none solid none' }}
              onChange={e => setPassword(e.target.value)}
              value={password}
              type="password"
            />
          </div>
          {
            enable ? <div className={style.item}>
              <div className={style.userLabel}>?????????</div>
              <input onKeyUp={e => { if (e.keyCode === 13) { handleSubmit(); } }}
                style={{ borderStyle: 'none none solid none' }}
                onChange={e => setCode(e.target.value)}
                value={code}
                type="text"
              />
              <div className={style.code} onClick={() => { getCodeImg(); }}><img src={captchaImg} className={style.code_img} /></div>
            </div> : <div></div>
          }


          <div className={style.remember}>
            <div className={style.remember_box}>
              <input
                type="checkbox"
                checked={expires === -1}
                onChange={() => {
                  setExpires(expires === -1 ? 3600000 : -1);
                }}
              />
              <div className={style.text}>?????????</div>
            </div>
          </div>

          <input
            onClick={() => {
              handleSubmit();
            }}
            className={style.btn}
            type="button"
            name="??????"
            value="??????"
          />
        </div>
      </div>
    </div>
  )
  // return isReady ? renderLogin() : <Spin spinning={isReady} />;
  return isReady ? Login() : <Spin spinning={isReady} />;
};
export default connect(({ login, loading, settings }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
  settings
}))(Login);
