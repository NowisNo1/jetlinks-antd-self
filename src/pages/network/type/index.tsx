import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Row,
  Col,
  Input,
  List,
  Tooltip,
  Icon,
  Avatar,
  Button,
  message,
  Popconfirm,
  Switch,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { connect } from 'dva';
import StandardFormRow from './components/standard-form-row';
import TagSelect from './components/tag-select';
import styles from './index.less';
import { ConnectState, Dispatch } from '@/models/connect';
import Save from './save';
import { downloadObject } from '@/utils/utils';
import apis from '@/services';
import encodeQueryParam from '@/utils/encodeParam';
import MqttClient from './debugger/mqtt-client';
import MqttServer from './debugger/mqtt-server';
import TcpClient from './debugger/tcp-client';
import TcpServer from './debugger/tcp-server';
import CoapServer from './debugger/coap-server';
import CoapClient from './debugger/coap-client';
import WebSocketServer from './debugger/websocket-server';
import WebSocketClient from './debugger/websocket-client';
import UdpSupport from './debugger/udp-support';
import HttpClient from './debugger/http-client';
import HttpServer from './debugger/http-server';
import AutoHide from '@/pages/analysis/components/Hide/autoHide';

interface Props extends FormComponentProps {
  dispatch: Dispatch;
  networkType: any;
  loading: boolean;
}
interface State {
  saveVisible: boolean;
  currentItem: any;
  supportsType: any[];
  filterType: string[];
  filterName: string;
  debuggerVisible: boolean;
}

const Type: React.FC<Props> = props => {
  const initState: State = {
    saveVisible: false,
    currentItem: {},
    supportsType: [],
    filterType: [],
    filterName: '',
    debuggerVisible: false,
  };

  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [supportsType, setSupportsType] = useState(initState.supportsType);
  const [filterType, setFilterType] = useState(initState.filterType);
  const [filterName, setFilterName] = useState(initState.filterName);
  const [debuggerVisible, setDebuggerVisible] = useState(initState.debuggerVisible);


  const formItemLayout = {
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const {
    dispatch,
    networkType: { result },
  } = props;

  const handleSearch = () => {
    dispatch({
      type: 'networkType/query',
      payload: encodeQueryParam({
        paging: false,
        sorts: {
          field: 'id',
          order: 'desc',
        },
        terms: {
          type$IN: filterType,
          name$LIKE: filterName,
        },
      }),
    });
  };

  useEffect(() => {
    handleSearch();
    apis.network
      .support()
      .then(response => {
        if (response.status === 200) {
          setSupportsType(response.result);
          console.log(response.result);
        }
      })
      .catch(() => {});

  }, []);

  const remove = (id: string) => {
    dispatch({
      type: 'networkType/remove',
      payload: id,
      callback: () => {
        message.success('????????????');
        handleSearch();
      },
    });
  };

  const insert = (data: any) => {
    dispatch({
      type: 'networkType/insert',
      payload: data,
      callback: () => {
        message.success('????????????');
        setSaveVisible(false);
        handleSearch();
      },
    });
  };

  const changeStatus = (item: any) => {
    let type;
    if (item.state?.value === 'disabled') {
      type = '_start';
    } else if (item.state.value === 'enabled') {
      type = '_shutdown';
    }
    if (!type) return;
    apis.network
      .changeStatus(item.id, type)
      .then(() => {
        message.success('????????????');
        handleSearch();
      })
      .catch(() => {});
  };

  const onSearch = (type?: string[], name?: string) => {
    dispatch({
      type: 'networkType/query',
      payload: encodeQueryParam({
        paging: false,
        sorts: {
          field: 'id',
          order: 'desc',
        },
        terms: {
          type$IN: type,
          name$LIKE: name,
        },
      }),
    });
  };

  const renderDebug = () => {
    const { type } = currentItem;
    let value = type;
    if (value === 'MQTT_CLIENT') {
      return <MqttClient close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'MQTT_SERVER') {
      return <MqttServer close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'TCP_CLIENT') {
      return <TcpClient close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'TCP_SERVER') {
      return <TcpServer close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'COAP_SERVER') {
      return <CoapServer close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'COAP_CLIENT') {
      return <CoapClient close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'WEB_SOCKET_SERVER') {
      return <WebSocketServer close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'WEB_SOCKET_CLIENT') {
      return <WebSocketClient close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'UDP') {
      return <UdpSupport close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'HTTP_SERVER') {
      return <HttpServer close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    if (value === 'HTTP_CLIENT') {
      return <HttpClient close={() => setDebuggerVisible(false)} item={currentItem} />;
    }
    return null;
  };

  return (
    <PageHeaderWrapper title="????????????">
      <div className={styles.filterCardList}>
        <Card bordered={false}>
          <Form layout="inline">
            <StandardFormRow title="????????????" block style={{ paddingBottom: 11 }}>
              <Row gutter={24}>
                <Col lg={20}>
                  <Form.Item>
                    <TagSelect
                      expandable
                      onChange={(value: any[]) => {
                        setFilterType(value);
                        onSearch(value, undefined);
                      }}
                    >
                      {supportsType.map(item => (
                        <TagSelect.Option key={item.id} value={item.id}>
                          {item.name}
                        </TagSelect.Option>
                      ))}
                    </TagSelect>
                  </Form.Item>
                </Col>
              </Row>
            </StandardFormRow>
            <StandardFormRow title="????????????" grid last>
              <Row gutter={16}>
                <Col lg={8} md={10} sm={10} xs={24}>
                  <Form.Item {...formItemLayout} label="????????????">
                    <Input
                      onChange={e => {
                        setFilterName(e.target.value);
                        onSearch(undefined, e.target.value);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </StandardFormRow>
          </Form>
        </Card>
        <br />
        <List<any>
          rowKey="id"
          grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
          loading={props.loading}
          dataSource={[{}, ...result]}
          renderItem={item => {
            if (item && item.id) {
              return (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    bodyStyle={{ paddingBottom: 20 }}
                    actions={[
                      // <Tooltip key="download" title="??????">
                      //   <Icon
                      //     type="download"
                      //     onClick={() => {
                      //       downloadObject(item, '??????');
                      //     }}
                      //   />
                      // </Tooltip>,
                      <Tooltip key="edit" title="??????">
                        <Icon
                          type="edit"
                          onClick={() => {
                            setSaveVisible(true);
                            setCurrentItem(item);
                          }}
                        />
                      </Tooltip>,
                      <Tooltip key="bug" title="??????">
                        <Icon
                          type="bug"
                          onClick={() => {
                            setCurrentItem(item);
                            setDebuggerVisible(true);
                          }}
                        />
                      </Tooltip>,
                      <Tooltip key="delete" title="??????">
                        <Popconfirm
                          placement="topRight"
                          title="???????????????????????????"
                          onConfirm={() => {
                            remove(item.id);
                          }}
                        >
                          <Icon type="close" />
                        </Popconfirm>
                      </Tooltip>,

                      // <Dropdown key="ellipsis" overlay={itemMenu}>
                      //     <Icon type="ellipsis" />
                      // </Dropdown>,
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar size="small" src={item.avatar} />}
                      title={
                        <AutoHide title={item.name} style={{ width: '95%', fontWeight: 600 }} />
                      }
                      style={{ fontWeight: 600 }}
                    />
                    <div className={styles.cardItemContent}>
                      <div className={styles.cardInfo}>
                        <div style={{ width: '33%', textAlign: 'center' }}>
                          <p>????????????</p>
                          <p style={{ fontWeight: 600 }}>{item.type}</p>
                        </div>
                        <div style={{ width: '33%', textAlign: 'center' }}>
                          <p>?????????</p>
                          <p style={{ fontWeight: 600 }}>{item.configuration?.port}</p>
                        </div>
                        <div style={{ width: '33%', textAlign: 'center' }}>
                          <p>????????????</p>
                          <p style={{ color: 'red' }}>
                            <Popconfirm
                              title={`??????${item.state?.value === 'disabled' ? '??????' : '??????'}`}
                              onConfirm={() => {
                                changeStatus(item);
                              }}
                            >
                              <span>
                                <Switch
                                  size="small"
                                  checked={
                                    item.state?.value === 'disabled'
                                      ? false
                                      : item.state?.value === 'enabled'
                                  }
                                />
                              </span>
                            </Popconfirm>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              );
            }
            return (
              <List.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    setCurrentItem({});
                    setSaveVisible(true);
                  }}
                  className={styles.newButton}
                >
                  <Icon type="plus" />
                  ????????????
                </Button>
              </List.Item>
            );
          }}
        />
      </div>
      {saveVisible && (
        <Save
          close={() => {
            setSaveVisible(false);
            setCurrentItem({});
          }}
          data={currentItem}
          save={(item: any) => {
            insert(item);
          }}
        />
      )}
      {debuggerVisible && renderDebug()
      // <Debugger close={() => setDebuggerVisible(false)} item={currentItem} />
      }
    </PageHeaderWrapper>
  );
};

export default connect(({ networkType, loading }: ConnectState) => ({
  networkType,
  loading: loading.models.networkType,
}))(Form.create<Props>()(Type));
