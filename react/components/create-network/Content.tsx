import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, Form, Button, Icon, Select, SelectBox, Tooltip,
} from 'choerodon-ui/pro';
import { map } from 'lodash';
import useNetWorkStore from './stores';

import './index.less';
import { ButtonColor, FuncType, Record } from '@/interface';

const { Option } = Select;

function FormContent() {
  const {
    refresh,
    formDs,
    portDs,
    targetLabelsDs,
    modal,
    intl: {
      formatMessage,
    },
    networkId,
    name,
    code,
  } = useNetWorkStore();

  const { current } = formDs;

  // eslint-disable-next-line consistent-return
  modal.handleOk(async () => {
    if (await formDs.submit() !== false) {
      refresh();
    } else {
      return false;
    }
  });

  const createPortGroup = () => {
    portDs.create();
  };

  function removePortGroup(record: any) {
    portDs.remove(record);
    portDs.validate();
  }

  const createTargetLabelGroup = () => {
    targetLabelsDs.create();
  };

  function removeTargetLabelGroup(record: any) {
    targetLabelsDs.remove(record);
    targetLabelsDs.validate();
  }

  const targetPortOptionRenderer = ({
    record,
    text,
    value,
  }:any) => <Tooltip title={value}>{value}</Tooltip>;

  const targetPortOptionsFilter = (record: { get: (arg0: string) => any; }) => !!record.get('portName');

  const labelOptionRenderer = ({ record, text, value }:any) => `${record.get('meaning')}`;

  const clearInputOption = (record: { get: (arg0: string) => any; }) => {
    const meaning = record.get('meaning');
    return meaning && meaning.indexOf(':') >= 0;
  };

  return (
    <>
      <div className="c7ncd-create-network">
        <Form dataSet={formDs} columns={3}>
          <TextField name="name" colSpan={3} maxLength={30} disabled={!!networkId} />
        </Form>

        <div className="hr" />
        <p className="network-panel-title">{formatMessage({ id: 'network.target' })}</p>

        <Form dataSet={formDs} columns={3}>
          <div
            className="network-panel-target-select"
            // @ts-expect-error
            colSpan={3}
          >
            <SelectBox name="target">
              <Option value="instance"><span className="target-instance">{formatMessage({ id: 'network.target.application' })}</span></Option>
              <Option value="param">{formatMessage({ id: 'network.target.param' })}</Option>
            </SelectBox>
          </div>
          {/* @ts-expect-error */}
          <div colSpan={3} className="target-form">
            {
              (current && current.get('target') === 'instance')
                ? (
                  <Select colSpan={3} name="appInstance" className="app-instance-select" disabled>
                    <Option value={code}>{name}</Option>
                  </Select>
                )
                : (
                  <div className="label-form">
                    {
                    map(targetLabelsDs.created, (record: Record | undefined, index: any) => (
                      <Form record={record} key={`target-label-record-${index}`} columns={4}>
                        <Select name="keyword" combo optionRenderer={labelOptionRenderer} optionsFilter={clearInputOption} />
                        <Icon className="network-group-icon" type="drag_handle" />
                        <Select name="value" combo optionRenderer={labelOptionRenderer} optionsFilter={clearInputOption} />
                        {
                        targetLabelsDs.created.length > 1 ? (
                          <Button
                            funcType={'flat' as FuncType}
                            // @ts-expect-error
                            colSpan={3}
                            className="c7ncd-form-record-delete-btn"
                            icon="delete"
                            onClick={() => removeTargetLabelGroup(record)}
                          />
                          // @ts-expect-error
                        ) : <span colSpan={1} />
                      }
                      </Form>
                    ))
                  }
                    <Button
                      color={'primary' as any}
                      funcType={'flat' as FuncType}
                      onClick={createTargetLabelGroup}
                      icon="add"
                    >
                      {formatMessage({ id: 'network.config.addtarget' })}
                    </Button>
                  </div>
                )
            }
          </div>
        </Form>

        <div className="hr" />
        <p className="network-panel-title">{formatMessage({ id: 'network.config' })}</p>

        <Form dataSet={formDs} columns={3}>
          {/* @ts-expect-error */}
          <div className="type-form" newLine colSpan={3}>
            <SelectBox name="type" record={current}>
              <Option value="ClusterIP"><span className="type-span">ClusterIP</span></Option>
              <Option value="NodePort"><span className="type-span">NodePort</span></Option>
              <Option value="LoadBalancer">LoadBalancer</Option>
            </SelectBox>
          </div>
          {current.get('type') === 'ClusterIP'
          && <TextField name="externalIps" record={current} colSpan={3} />}
        </Form>

        <div className="group-port">
          {
            map(portDs.created, (record: Record | undefined, index: any) => (
              <Form record={record} key={`port-record-${index}`} columns={5}>

                {
                current.get('type') !== 'ClusterIP'
                  && <TextField name="nodePort" maxLength={5} />
              }
                <TextField name="port" maxLength={5} />
                <Select name="targetPort" combo optionRenderer={targetPortOptionRenderer} clearButton={false} optionsFilter={targetPortOptionsFilter} />
                {
                current.get('type') === 'NodePort'
                && (
                <Select name="protocol" clearButton={false}>
                  {map(['TCP', 'UDP'], (item: {} | null | undefined) => (
                    // @ts-expect-error
                    <Option value={item} key={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
                )
              }
                {
                portDs.created.length > 1 ? (
                  <Button
                    funcType={'flat' as FuncType}
                    // @ts-expect-error
                    colSpan={3}
                    className="c7ncd-form-record-delete-btn"
                    icon="delete"
                    onClick={() => removePortGroup(record)}
                  />
                  // @ts-expect-error
                ) : <span colSpan={3} />
              }
              </Form>
            ))
          }
          <Button
            color={'primary' as ButtonColor}
            funcType={'flat' as FuncType}
            onClick={createPortGroup}
            icon="add"
            style={{
              marginBottom: '20px',
            }}
          >
            {formatMessage({ id: 'network.config.addport' })}
          </Button>
        </div>
      </div>
    </>
  );
}

export default observer(FormContent);
