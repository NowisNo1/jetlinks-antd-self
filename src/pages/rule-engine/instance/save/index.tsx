import React from "react";
import {Form, Input, message, Modal, Select} from "antd";
import {FormComponentProps} from "antd/es/form";
import apis from "@/services";
import {RuleInstanceItem} from "@/pages/rule-engine/instance/data";

/**
 * @author Luo
 * @createTime 2023-02-28
 * @comment 创建规则的表单
 */
interface Props extends FormComponentProps {
  data?: Partial<RuleInstanceItem>
  close: Function
}

const Save = (props: Props) => {
  const {form, form: {getFieldDecorator}} = props;
  const save = () => {
    form.validateFields((err, fileValue) => {
      if (err){

        return;
      }
      // 此处存在改动 2023-02-28
      // if (props.data) {
      //   fileValue.modelType = props.data.modelType;
      //   fileValue.modelMeta = props.data.modelMeta;
      // }
      fileValue.modelVersion = 1;
      fileValue.modelType = "node-red";
      if (props.data?.modelType) {
        fileValue.modelType = props.data.modelType;
      }
      if (props.data?.modelMeta){
        fileValue.modelMeta = props.data.modelMeta;
      }
      /**
       * 后端实现这个接口，之后将对应数据保存
       */
      apis.ruleInstance.create(fileValue).then(resp => {
        console.log(resp);
        if(resp != undefined) {
          if (resp.status === 200) {
            message.success('保存成功');
            props.close();
            // window.open(`/rule-engine/instance/index.tsx`);
          }
        }
      })
     })
  };
  return (
    <Modal
      visible
      title="新建规则实例"
      onCancel={() => props.close()}
      onOk={() => {
        save()
      }}
    >
      <Form labelCol={{span: 4}} wrapperCol={{span: 20}}>
        <Form.Item key="id" label="ID">
          {getFieldDecorator('id', {
            rules: [{required: true, message: '请输入实例ID'}],
          })(<Input placeholder="请输入实例ID"/>)}
        </Form.Item>
        <Form.Item key="name" label="名称">
          {getFieldDecorator('name', {
            rules: [{required: true, message: '请输入实例名称'}],
          })(<Input placeholder="请输入名称"/>)}
        </Form.Item>
        <Form.Item key="description" label="说明">
          {getFieldDecorator('description', {})(<Input.TextArea rows={3}/>)}
        </Form.Item>

      </Form>
    </Modal>
  )
};
export default Form.create<Props>()(Save);
