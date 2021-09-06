import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import { useBatchDeployStore } from '../../stores';

const { Option } = SelectBox;

export default observer(() => {
  const {
    formatMessage,
    prefixCls,
    batchDeployDs,
    portsDs,
    networkDs,
  } = useBatchDeployStore();

  const record = networkDs.current;

  function handleRemovePort(portRecord:any) {
    portsDs.remove(portRecord);
    portsDs.validate();
  }

  function handlePortAdd() {
    portsDs.create();
  }

  return (
    <div className={`${prefixCls}-resource-network`}>
      <Form dataSet={networkDs}>
        <TextField
          name="name"
          disabled={batchDeployDs.current && !batchDeployDs.current.get('environmentId')}
        />
        <SelectBox name="type" className={`${prefixCls}-resource-mgt-12`}>
          <Option value="ClusterIP">
            <span className={`${prefixCls}-resource-radio`}>ClusterIP</span>
          </Option>
          <Option value="NodePort">
            <span className={`${prefixCls}-resource-radio`}>NodePort</span>
          </Option>
          <Option value="LoadBalancer">
            <span className={`${prefixCls}-resource-radio`}>LoadBalancer</span>
          </Option>
        </SelectBox>
        {record?.get('type') === 'ClusterIP' && <TextField name="externalIp" />}
      </Form>
      {map(portsDs.data, (portRecord) => (
        <Form record={portRecord} key={portRecord.id} columns={13}>
          {
            record?.get('type') !== 'ClusterIP'
            && <TextField name="nodePort" colSpan={3} />
          }
          <TextField name="port" colSpan={3} />
          <TextField name="targetPort" colSpan={3} />
          {
            record?.get('type') === 'NodePort'
            && <Select name="protocol" colSpan={3} />
          }
          {
            portsDs.length > 1 ? (
              <Button
                funcType={'flat' as any}
                icon="delete"
                onClick={() => handleRemovePort(portRecord)}
                className={`${prefixCls}-resource-delete-btn`}
              />
            ) : <span />
          }
        </Form>
      ))}
      <Button
        color={'primary' as any}
        funcType={'flat' as any}
        onClick={handlePortAdd}
        icon="add"
      >
        {formatMessage({ id: 'network.config.addport' })}
      </Button>
    </div>
  );
});
