import React, { useState } from 'react';
import { Button, Card, Descriptions, Icon, message, Popconfirm, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { DeviceInstance } from '@/pages/device/instance/data';
import Configuration from './configuration';
import Save from '../../Save';
import Tags from './tags/tags';
import apis from '@/services';
import {response} from "express";
import { pointInPolygon } from "@/pages/device/instance/service";

interface Props {
  data: Partial<DeviceInstance>;
  configuration: any;
  refresh: Function;
}

interface State {
  updateVisible: boolean;
  tagsVisible: boolean;
  addVisible: boolean;
}

const Info: React.FC<Props> = props => {
  const initState: State = {
    updateVisible: false,
    tagsVisible: false,
    addVisible: false,
  };
  const [updateVisible, setUpdateVisible] = useState(initState.updateVisible);
  const [tagsVisible, setTagsVisible] = useState(initState.tagsVisible);
  const [addVisible, setAddVisible] = useState(initState.addVisible);

  const updateData = (item?: any) => {
    setUpdateVisible(false);
    apis.deviceInstance
      .update(props.data.id, item)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('配置信息修改成功');
          props.refresh();
        }
      })
      .catch(() => {});
  };
  const saveTags = (item?: any) => {
    setTagsVisible(false);
    apis.deviceInstance
      .saveDeviceTags(props.data.id, item)
      .then((res: any) => {
        if (res.status === 200) {
          message.success('标签信息保存成功');
          props.refresh();
          //在这里进行标签中geoPoint的判断
          //获取所有的geoJson之后进行遍历，通过计算几何求解是否处于区域内部
          //区域变换也要实现
          let point = item[0].value.split(',');
          let old = [-1, -1];
          let oldJson = null;
          let st = false;
          let st1 = false;
          let tags = null;
          //只取第一个
          item.map((o: any) =>{
            if(o.type === "geoPoint" && st1 === false){
              console.log("进入这个if");
              st1 = true;
              tags = o;
              console.log( tags);
            }
          });
          if(tags !== null){
            apis.location._search_geo_json(null)
              .then((response: any) =>{
                if(response.status === 200){
                  message.success('获取到了所有的地理信息');
                  if(response.result.length > 0){
                    response.result.map((item: any) => {
                      let tmp = JSON.parse(item.features);
                      let feature = tmp[0];

                      if(String(feature.geometry.type) === String("geoPoint")){
                        console.log(props.data.id);
                        //规定一个设备只能属于一个区域，所以只要找到就可以
                        if(feature.properties.objectId === props.data.id){
                          old = feature.geometry.coordinates;
                          oldJson = item;
                        }
                      }
                    });
                    response.result.map((item: any) => {
                      let tmp = JSON.parse(item.features);
                      let feature = tmp[0];
                      if(String(feature.geometry.type) === String("MultiPolygon")){
                        let Points = [];
                        feature.geometry.coordinates[0][0].map((p: any, idx: number) =>{
                          Points.push(p);
                        });
                        let f = pointInPolygon(point, Points);
                        //在内部的话就需要生成或者更新point类型的Json
                        //只更新到第一个可以更新的区域
                        if(f === true && st === false){
                          console.log(101);
                          console.log(old);
                          st = true;
                          //生成新的
                          if(old[0] === -1 && old[1] === -1){
                            let geoEntity =
                              {
                                type: 'FeatureCollection',
                                features: [{
                                  type: 'Feature',
                                  properties: {
                                    regionId: feature.properties.id,
                                    objectId: tags.deviceId,
                                    objectType: "device",
                                  },
                                  geometry: {
                                    type: 'geoPoint',
                                    coordinates: point,
                                  },
                                }],
                              };
                            let params = {"type": geoEntity.type, "features": JSON.stringify(geoEntity.features)};
                            apis.location.saveByGeoJson(params)
                              .then((response: any)=>{
                                if(response.status === 200){
                                  message.success("新建geoJson成功");
                                }
                              });
                            console.log(geoEntity);
                          }
                          else { //更新原有的
                            if(oldJson !== null){
                              let newFeatures = JSON.parse(oldJson.features);
                              newFeatures[0].geometry.coordinates = point;
                              newFeatures[0].properties.regionId = feature.properties.id;
                              console.log(oldJson.id);
                              console.log(tags);
                              let params = {"id": oldJson.id, "type": oldJson.type, "features": JSON.stringify(newFeatures)};
                              apis.location.saveByGeoJson(params)
                                .then((response: any)=>{
                                  if(response.status === 200){
                                    message.success("更新geoJson成功");
                                  }
                                });
                              console.log(params);
                            }
                          }
                        }
                      }
                    });
                    //这是一个没有包含在任意区域内的点
                    if(st === false){
                      if(tags !== null){
                        //生成新的
                        if(old[0] === -1 && old[1] === -1){
                          let geoEntity =
                            {
                              type: 'FeatureCollection',
                              features: [{
                                type: 'Feature',
                                properties: {
                                  objectId: tags.deviceId,
                                  objectType: "device",
                                },
                                geometry: {
                                  type: 'geoPoint',
                                  coordinates: point,
                                },
                              }],
                            };
                          let params = {"type": geoEntity.type, "features": JSON.stringify(geoEntity.features)};
                          apis.location.saveByGeoJson(params)
                            .then((response: any)=>{
                              if(response.status === 200){
                                message.success("新建geoJson成功");
                              }
                            });
                          console.log(geoEntity);
                        }
                        else { //更新原有的
                          if(oldJson !== null){
                            let newFeatures = JSON.parse(oldJson.features);
                            newFeatures[0].geometry.coordinates = point;
                            newFeatures[0].properties.regionId = undefined;
                            let params = {"id": oldJson.id, "type": oldJson.type, "features": JSON.stringify(newFeatures)};
                            apis.location.saveByGeoJson(params)
                              .then((response: any)=>{
                                if(response.status === 200){
                                  message.success("更新geoJson成功");
                                }
                              });
                          }
                        }
                      }
                    }
                  }



                }
              })
          }

        }
      })
      .catch(() => {});
  };

  const changeDeploy = (deviceId: string | undefined) => {
    apis.deviceInstance
      .changeDeploy(deviceId)
      .then(response => {
        if (response.status === 200) {
          message.success('应用成功');
          props.refresh(props.data.id);
        }
      })
      .catch(() => {});
  };

  const configurationReset = (deviceId: string | undefined) => {
    apis.deviceInstance
      .configurationReset(deviceId)
      .then(response => {
        if (response.status === 200) {
          message.success('恢复默认配置成功');
          props.refresh();
        }
      })
      .catch(() => {});
  };

  const deleteBinds = (deviceId: string | undefined, bindType: string, bindKey: string) => {
    apis.deviceInstance.deleteBinds(deviceId, bindType, bindKey).then(res => {
      if (res.status === 200) {
        message.success('解绑成功！');
        props.refresh();
      }
    });
  };

  const renderComponent = (item: any) => {
    if (props.data.configuration) {
      if (item.type.type === 'password' && props.data.configuration[item.property]?.length > 0) {
        return '••••••';
      }
      if (isExit(item.property)) {
        return (
          <div>
            <span style={{ marginRight: '10px' }}>{props.data.configuration[item.property]}</span>
            <Tooltip title={`有效值:${props.data.cachedConfiguration[item.property]}`}>
              <Icon type="info-circle-o" />
            </Tooltip>
          </div>
        );
      } else {
        return <span>{props.data.configuration[item.property]}</span>;
      }
    } else {
      return null;
    }
  };

  const isExit = (property: string) => {
    return (
      props.data.cachedConfiguration &&
      props.data.cachedConfiguration[property] !== undefined &&
      props.data.configuration[property] !== props.data.cachedConfiguration[property]
    );
  };

  return (
    <div>
      <Card style={{ marginBottom: 20 }}>
        <Descriptions
          style={{ marginBottom: 20 }}
          bordered
          column={3}
          size="small"
          title={
            <span>
              设备信息
              <Button
                icon="edit"
                style={{ marginLeft: 20 }}
                type="link"
                onClick={() => setAddVisible(true)}
              >
                编辑
              </Button>
            </span>
          }
        >
          <Descriptions.Item label="产品名称" span={1}>
            {props.data.productName}
          </Descriptions.Item>
          <Descriptions.Item label="设备类型" span={1}>
            {props.data.deviceType?.text}
          </Descriptions.Item>
          <Descriptions.Item label="所属机构" span={1}>
            {props.data.orgName}
          </Descriptions.Item>
          <Descriptions.Item label="连接协议" span={1}>
            {props.data.transport}
          </Descriptions.Item>
          <Descriptions.Item label="消息协议" span={1}>
            {props.data.protocolName || props.data.protocol}
          </Descriptions.Item>
          <Descriptions.Item label="IP地址" span={1}>
            {props.data.address}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={1}>
            {moment(props.data.createTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间" span={1}>
            {props.data.state?.value !== 'notActive'
              ? moment(props.data.registerTime).format('YYYY-MM-DD HH:mm:ss')
              : '/'}
          </Descriptions.Item>
          <Descriptions.Item label="最后上线时间" span={1}>
            {props.data.state?.value !== 'notActive' && !!props.data.onlineTime
              ? moment(props.data.onlineTime).format('YYYY-MM-DD HH:mm:ss')
              : '/'}
          </Descriptions.Item>
          <Descriptions.Item label="说明" span={3}>
            {props.data.describe || props.data.description}
          </Descriptions.Item>
          {props.data.binds && props.data.binds.length > 0 && (
            <Descriptions.Item label="云对云接入" span={3}>
              {props.data.binds.map((i: any, index: number) => {
                return (
                  <Tag color="blue" key={index}>
                    <Tooltip title={i.description}>
                      <span>{i.bindName}</span>
                    </Tooltip>
                    <Popconfirm
                      title={`是否解绑${i.bindName}接入`}
                      onConfirm={() => {
                        deleteBinds(props.data.id, i.bindType, i.bindKey);
                      }}
                    >
                      <span style={{ display: 'inline-block', marginLeft: '10px' }}>×</span>
                    </Popconfirm>
                  </Tag>
                );
              })}
            </Descriptions.Item>
          )}
        </Descriptions>

        {props.configuration && props.configuration.length > 0 && (
          <div style={{ width: '100%' }}>
            <Descriptions
              title={
                <span>
                  配置
                  <Button
                    icon="edit"
                    style={{ marginLeft: 20 }}
                    type="link"
                    onClick={() => setUpdateVisible(true)}
                  >
                    编辑
                  </Button>
                  {props.data.state?.value != 'notActive' && (
                    <Popconfirm
                      title="确认重新应用该配置？"
                      onConfirm={() => {
                        changeDeploy(props.data.id);
                      }}
                    >
                      <Button icon="check" type="link">
                        应用配置
                      </Button>
                      <Tooltip title="修改配置后需重新应用后才能生效。">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </Popconfirm>
                  )}
                  {props.data.aloneConfiguration && (
                    <Popconfirm
                      title="确认恢复默认配置？"
                      onConfirm={() => {
                        configurationReset(props.data.id);
                      }}
                    >
                      <Button icon="undo" type="link">
                        恢复默认
                      </Button>
                      <Tooltip
                        title={`该设备单独编辑过配置信息，点击此将恢复成默认的配置信息，请谨慎操作。`}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </Popconfirm>
                  )}
                </span>
              }
            />
            {props.configuration.map((i: any) => (
              <div style={{ marginBottom: '20px' }} key={i.name}>
                <h3>{i.name}</h3>
                <Descriptions bordered column={2} title="">
                  {i.properties &&
                    i.properties.map((item: any) => (
                      <Descriptions.Item
                        label={
                          item.description ? (
                            <div>
                              <span style={{ marginRight: '10px' }}>{item.name}</span>
                              <Tooltip title={item.description}>
                                <Icon type="question-circle-o" />
                              </Tooltip>
                            </div>
                          ) : (
                            item.name
                          )
                        }
                        span={1}
                        key={item.property}
                      >
                        {renderComponent(item)}
                        {/* {props.data.configuration ?
                        (
                          item.type.type === 'password' ? (
                            props.data.configuration[item.property]?.length > 0 ? '••••••' : null
                          ) : props.data.configuration[item.property]
                        ) : null} */}
                      </Descriptions.Item>
                    ))}
                </Descriptions>
              </div>
            ))}
          </div>
        )}
        {props.data.tags && props.data.tags.length > 0 && (
          <Descriptions
            style={{ marginBottom: 20 }}
            bordered
            column={3}
            size="small"
            title={
              <span>
                {'标签'}
                <Button
                  icon="edit"
                  style={{ marginLeft: 20 }}
                  type="link"
                  onClick={() => setTagsVisible(true)}
                >
                  编辑
                </Button>
              </span>
            }
          >
            {props.data.tags &&
              props.data.tags?.map((item: any) => (
                <Descriptions.Item label={`${item.name}（${item.key})`} span={1} key={item.key}>
                  {item.value}
                </Descriptions.Item>
              ))}
          </Descriptions>
        )}
      </Card>
      {addVisible && (
        <Save
          data={{
            describe: props.data.description,
            id: props.data.id,
            name: props.data.name,
            productId: props.data.productId,
            orgId: props.data.orgId,
          }}
          close={() => {
            setAddVisible(false);
            //setCurrentItem({});
          }}
        />
      )}
      {updateVisible && (
        <Configuration
          data={props.data}
          configuration={props.configuration}
          close={() => {
            setUpdateVisible(false);
            props.refresh();
          }}
          save={(item: any) => {
            updateData(item);
          }}
        />
      )}

      {tagsVisible && (
        <Tags
          data={props.data.tags}
          deviceId={props.data.id}
          close={() => {
            setTagsVisible(false);
            props.refresh();
          }}
          save={(item: any) => {
            saveTags(item);
          }}
        />
      )}
    </div>
  );
};

export default Info;
