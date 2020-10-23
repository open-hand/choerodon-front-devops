import React, { useEffect, useState } from 'react';
import { Form, SelectBox, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const { Option } = Select;

const RemoveForm = observer(({ nodeName, modal }) => {
  const [formData, setFormData] = useState([]);
  useEffect(() => {

  }, []);

  function changeData(props) {
    props && setFormData([...props]);
  }

  function handleSubmit() {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  modal.handleOk(handleSubmit);

  return (
    <div>
      <p>{`确认要移除节点"${nodeName}"的角色吗?`}</p>
      <Form className="c7ncd-cluster-nodelists-roleRemoveForm">
        <SelectBox multiple onChange={changeData} value={formData}>
          <Option value="master">
            移除master角色
          </Option>
          <Option value="etcd">
            移除etcd角色
          </Option>
        </SelectBox>
      </Form>
    </div>
  );
});

export default RemoveForm;
