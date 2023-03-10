import React, {Fragment, useEffect, useState} from 'react';
import {FormComponentProps} from 'antd/lib/form';
import Form from 'antd/es/form';
import {Button, Divider, Drawer, message, Popconfirm, Spin, Table} from 'antd';
import styles from '@/utils/table.less';
import {ColumnProps} from 'antd/lib/table';
import apis from '@/services';
import SaveRegion from '@/pages/device/location/save/region';

interface Props extends FormComponentProps {
  close: Function;
}

interface State {
  regionList: any[];
  regionData: any;
  regionAllData: any;
}

const ManageRegion: React.FC<Props> = props => {
  const initState: State = {
    regionList: [],
    regionData: {},
    regionAllData: {},
  };

  const [regionList, setRegionList] = useState(initState.regionList);
  const [regionData, setRegionData] = useState(initState.regionData);
  const [regionAllData] = useState(initState.regionAllData);
  const [saveRegion, setSaveRegion] = useState(false);
  const [spinning, setSpinning] = useState(true);

  const handleSearch = (params?: any) => {
    regionList.splice(0, regionList.length);
    apis.location._search_geo_json(params)
      .then(response => {
          if (response.status === 200) {

            let list: any[] = [];
            response.result.map((item: any) =>{
              let obj = JSON.parse(item.features);
              obj.map((item: any) =>{
                if(item.geometry.type === "MultiPolygon"){
                  list.push(item.properties);
                  regionAllData[item.properties.id] = item;
                }
              });
            });
            setTreeData(list);
          }
          setSpinning(false);
        },
      ).catch(() => {
    });
  };


  const setTreeData = (arr: any[]) => {
    arr.forEach(function (item) {
      delete item.children;
    });
    let map = {};
    arr.forEach(i => {
      map[i.id] = i;
    });
    let treeData: any[] = [];
    arr.forEach(child => {
      const mapItem = map[child.parentId];
      if (mapItem) {
        (mapItem.children || (mapItem.children = [])).push(child);
      } else {
        treeData.push(child);
      }
    });
    setRegionList(treeData);
    setSpinning(false);
  };

  useEffect(() => {
    handleSearch({
      filter: {
        where: 'objectType not device',
        pageSize: 1000
      },
    });
  }, []);

  const saveByGeoJson = (data: any) => {
    let tmp = {"features": JSON.stringify(data.features), "type": data.type};
    apis.location.saveByGeoJson(tmp)
      .then((response: any) => {
        if (response.status === 200) {
          message.success('????????????????????????');
          setTimeout(function () {
            handleSearch({
              filter: {
                where: 'objectType not device',
                pageSize: 1000
              },
            });
          }, 1000);
        }
      })
      .catch(() => {
      });
  };

  const _delete = (record: any) => {
    apis.location._delete(record.id)
      .then(response => {
          if (response.status === 200) {
            message.success('????????????');
            setTimeout(function () {
              handleSearch({
                filter: {
                  where: 'objectType not device',
                  pageSize: 1000
                },
              });
            }, 1000);
          }
        },
      ).catch(() => {
    });
  };

  const columns: ColumnProps<any>[] = [
    {
      title: '????????????',
      dataIndex: 'id',
      width: '50%',
    },
    {
      title: '????????????',
      dataIndex: 'name',
      width: '30%',
    },
    {
      title: '??????',
      width: '20%',
      render: (text, record) => (
        <Fragment>
          <a
            onClick={() => {
              setSaveRegion(true);
              console.log("region/index/148");
              setRegionData(regionAllData[record.id]);
              console.log(regionData);
            }}
          >
            ??????
          </a>
          <Divider type="vertical"/>
          <Popconfirm
            title="???????????????????????????"
            onConfirm={() => {
              setSpinning(true);
              _delete(record);
            }}
          >
            <a>??????</a>
          </Popconfirm>
        </Fragment>
      ),
    },
  ];

  return (
    <Drawer
      visible
      title='????????????'
      width='50%'
      onClose={() => props.close()}
      closable
    >
      <Spin tip="?????????..." spinning={spinning}>
        <div className={styles.tableListOperator}>
          <Button
            icon="plus"
            type="primary"
            onClick={() => {

              setSaveRegion(true);
              setRegionData({});
            }}
          >
            ??????
          </Button>
        </div>
        <div className={styles.StandardTable} style={{paddingTop: 20}}>
          <Table
            dataSource={regionList}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </div>
      </Spin>
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
        }}
      >
        <Button
          onClick={() => {
            props.close();
          }}
          style={{marginRight: 8}}
        >
          ??????
        </Button>
      </div>
      {saveRegion && (
        <SaveRegion data={regionData} save={(data: any) => {
          setSpinning(true);
          saveByGeoJson(data);
          setSaveRegion(false);
        }} close={() => {
          setSpinning(true);
          handleSearch({
            filter: {
              where: 'objectType not device',
              pageSize: 1000
            },
          });
          setSaveRegion(false);
        }}/>
      )}
    </Drawer>
  );
};

export default Form.create<Props>()(ManageRegion);
