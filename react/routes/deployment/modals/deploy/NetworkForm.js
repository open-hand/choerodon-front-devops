import React, { useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import { useManualDeployStore } from './stores';

const { Option } = SelectBox;

export default observer(({ cRef, envId }) => {
  const {
    intl: { formatMessage },
    prefixCls,
    manualDeployDs,
    portsDs,
    networkDs,
  } = useManualDeployStore();

  useImperativeHandle(cRef, () => ({
    getDevopsServiceReqVO: async () => {
      const newworkResult = networkDs.validate();
      const portsResult = portsDs.validate();
      if (newworkResult && portsResult) {
        return ({
          devopsServiceReqVO: {
            ...networkDs.current.toData(),
            externalIp: networkDs.current.get('externalIp').join(','),
            ports: portsDs.toData(),
          },
        });
      }
      return false;
    },
  }));

  const record = networkDs.current;

  function handleRemovePort(portRecord) {
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
          disabled={!manualDeployDs.current.get('environmentId') && !envId}
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
        {record.get('type') === 'ClusterIP' && <TextField name="externalIp" />}
      </Form>
      {map(portsDs.data, (portRecord) => (
        <Form record={portRecord} key={portRecord.id} columns={5}>
          {
            record.get('type') !== 'ClusterIP'
            && <TextField name="nodePort" />
          }
          <TextField name="port" />
          <TextField name="targetPort" />
          {
            record.get('type') === 'NodePort'
            && <Select name="protocol" />
          }
          {
            portsDs.length > 1 ? (
              <Button
                funcType="flat"
                icon="delete"
                onClick={() => handleRemovePort(portRecord)}
                className={`${prefixCls}-resource-delete-btn`}
                colSpan={3}
              />
            ) : <span colSpan={3} />
          }
        </Form>
      ))}
      <Button
        color="primary"
        funcType="flat"
        onClick={handlePortAdd}
        icon="add"
      >
        {formatMessage({ id: 'network.config.addport' })}
      </Button>
    </div>
  );
});
