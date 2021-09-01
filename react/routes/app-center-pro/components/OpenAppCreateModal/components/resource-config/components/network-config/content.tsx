import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  Form, TextField, SelectBox, Select, Button,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import {
  useNetworkConfig,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config/stores';
import { mapping } from './stores/networkConfigDataSet';
import { FuncType, ButtonColor } from '@/interface';

import './index.less';

const Index = observer(() => {
  const {
    NetworkConfigDataSet,
    envId,
    PortsDataSet,
    cRef,
  } = useNetworkConfig();

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const configFlag = await NetworkConfigDataSet.validate();
      const portsFlag = await PortsDataSet.validate();
      if (configFlag && portsFlag) {
        const configData = NetworkConfigDataSet.current.toData();
        if (!configData[mapping.netName.name as string]) {
          return null;
        }
        return ({
          [mapping.netName.name as string]: configData[mapping.netName.name as string],
          [mapping.netType.name as string]: configData[mapping.netType.name as string],
          [mapping.externalIp.name as string]: configData[mapping.externalIp.name as string].join(','),
          [mapping.externalIp.name as string]: configData[mapping.externalIp.name as string].join(','),
          ports: PortsDataSet.toData(),
        });
      }
      return false;
    },
    getNetName: () => NetworkConfigDataSet.current.get(mapping.netName.name),
    getPorts: () => PortsDataSet.toData(),
  }));

  function handleRemovePort(portRecord: any) {
    PortsDataSet.remove(portRecord);
    PortsDataSet.validate();
  }

  function handlePortAdd() {
    PortsDataSet.create();
  }

  return (
    <div className="c7ncd-appCenterPro-newConfig">
      <p className="c7ncd-appCenterPro-newConfig__title">网络 (Service)</p>
      <Form dataSet={NetworkConfigDataSet}>
        <TextField
          name={mapping.netName.name}
          disabled={!envId}
        />
        <SelectBox
          name={mapping.netType.name}
        />
        {
          NetworkConfigDataSet.current.get(mapping.netType.name) === 'ClusterIP' && (
            <TextField
              name={mapping.externalIp.name}
            />
          )
        }
      </Form>
      {
        PortsDataSet.records.map((portRecord: any) => (
          <Form record={portRecord} key={portRecord.id} columns={4}>
            {
              NetworkConfigDataSet.current.get('type') !== 'ClusterIP'
              && <TextField name="nodePort" />
            }
            <TextField
              name="port"
            />
            <TextField name="targetPort" />
            {
              NetworkConfigDataSet.current.get('type') === 'NodePort'
              && <Select name="protocol" />
            }
            {
              PortsDataSet.records.length > 1 ? (
                <Button
                  funcType={'flat' as FuncType}
                  icon="delete"
                  onClick={() => handleRemovePort(portRecord)}
                  // @ts-ignore
                  colSpan={3}
                />
              ) : (
                // @ts-ignore
                <span colSpan={3} />
              )
            }
          </Form>
        ))
      }
      <Button
        color={'primary' as ButtonColor}
        funcType={'flat' as FuncType}
        onClick={() => handlePortAdd()}
        icon="add"
      >
        添加端口
      </Button>
    </div>
  );
});

export default Index;
