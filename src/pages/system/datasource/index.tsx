import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {Button, Card, Col, Divider, Form, message, Popconfirm, Row} from 'antd';
import React, { Fragment, useEffect, useState } from 'react';
import styles from '@/utils/table.less';
import SearchForm from '@/components/SearchForm';
import ProTable from '../permission/component/ProTable';
import Service from './service';
import encodeQueryParam from '@/utils/encodeParam';
import Save from './save';
import SelectForm from './save/SelectForm';
import StandardFormRow from "@/pages/network/type/components/standard-form-row";
import TagSelect from "@/pages/network/type/components/tag-select";

export const service = new Service('datasource/config');

const Datasource = () => {
  const [result, setResult] = useState<any>({});
  const [searchParam, setSearchParam] = useState<any>({
    pageIndex: 0,
    pageSize: 10,
    sorts: { field: 'id', order: 'desc' },
  });
  const [visible, setVisible] = useState<boolean>(false);
  const [manageVisible, setManageVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<any>({});
  const supportsType = [{name : '用户数据源'},{ name : '系统数据源'}];
  const columns = [
    {
      title: '类型',
      dataIndex: 'typeId',
    },
    {
      title: '编码',
      dataIndex: 'id',
    },
    {
      title: '数据源名称',
      dataIndex: 'name',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'create-time',
    },
    {
      title: '最近更新时间',
      dataIndex: 'nearby-time',
    },
    {
      title: '状态',
      dataIndex: 'state',
      render: (value: any) => value.text,
    },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Fragment>
          <a
            onClick={() => {
              setCurrent(record);
              setVisible(true);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          {record.state.value === 'enabled' ? (
            <Popconfirm
              title="确认禁用吗？"
              onConfirm={() => {
                service.changeStatus(record.id, 'disable').subscribe(
                  () => message.success('操作成功'),
                  () => {},
                  () => handleSearch(searchParam),
                );
              }}
            >
              <a>禁用</a>
            </Popconfirm>
          ) : (
            <>
              <Popconfirm
                title="确认启用吗？"
                onConfirm={() => {
                  service.changeStatus(record.id, 'enable').subscribe(
                    () => message.success('操作成功'),
                    () => {},
                    () => handleSearch(searchParam),
                  );
                }}
              >
                <a>启用</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm
                title="确认删除吗？"
                onConfirm={() => {
                  service.remove(record.id).subscribe(() => {
                    message.success('操作成功');
                    handleSearch(searchParam);
                  });
                }}
              >
                <a>删除</a>
              </Popconfirm>
            </>
          )}
          {
            record.typeId === 'rdb' &&
            <>
              <Divider type="vertical" />
              <a onClick={() => {
                setCurrent(record);
                setManageVisible(true);
              }}>管理</a>
            </>
          }
        </Fragment>
      ),
    },
  ];

  useEffect(() => {
    //handleSearch(searchParam);
  }, []);

  const handleSearch = (param: any) => {
    setSearchParam(param);
    service.query(encodeQueryParam(param)).subscribe(data => {
      setResult(data);
    });
  };
  return (
    <PageHeaderWrapper title="数据源管理">
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                setSearchParam(params);
                handleSearch({ terms: params, pageSize: 10 });
              }}
              formItems={[
                {
                  label: '数据源名称',
                  key: 'id',
                  type: 'string',
                },
                {
                  label: '类型',
                  key: 'name$LIKE',
                  type: 'string',
                },
              ]}
            />
            <div>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  setVisible(true);
                }}
              >
                新建
              </Button>
            </div>
          </div>
        </div>

      </Card>
      <Card className={styles.StandardTable}>
        <StandardFormRow title="数据类型" block style={{ paddingBottom: 11 }}>
          <Row gutter={24}>
            <Col lg={20}>
              <Form.Item>
                <TagSelect
                  expandable
                  onChange={(value: any[]) => {
                    /**
                     * @author Luoxingyue
                     * @CreateTime 2022-08-08
                     * @StandardFormRow是我加上的
                     */
                    //添加检索功能，根据当前的tag进行检索
                    console.log(value);
                    //这个value就是选择的tag的名字,数组形式
                    /**
                     * @handleSearch 自带的方法，可以尝试用这个达到搜索的目的
                     * 相当于在 handleSearch(searchParam) 方法中
                     * @searchParam 传入数据源的类型
                     */
                  }}
                >
                  {supportsType.map(item => (
                    <TagSelect.Option key={item.name} value={item.name}>
                      {item.name}
                    </TagSelect.Option>
                  ))}
                </TagSelect>
              </Form.Item>
            </Col>
          </Row>
        </StandardFormRow>
        <ProTable
          dataSource={result?.data}
          columns={columns}
          rowKey="id"
          onSearch={(params: any) => {
            handleSearch({ ...params, terms: { ...params?.terms, ...searchParam?.terms } });
          }}
          paginationConfig={result}
        />
      </Card>
      {visible && (
        <Save
          close={() => {
            setVisible(false);
            setCurrent({});
            handleSearch(searchParam);
          }}
          //   visible={visible}
          data={current}
        />
      )}
      {
        manageVisible && (
          <SelectForm data={current} save={() => {
            setManageVisible(false);
            setCurrent({  });
          }} />
        )
      }
    </PageHeaderWrapper>
  );
};
export default Datasource;
