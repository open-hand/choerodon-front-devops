/* eslint-disable react/jsx-no-bind */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, Form, Button, Icon, Select, SelectBox, Tooltip,
} from 'choerodon-ui/pro';
import { map } from 'lodash';
import { CustomSelect } from '@choerodon/components';
import useNetWorkStore from '../stores';
import '../index.less';

const { Option } = Select;

function FormContent() {
  const {
    refresh,
    formDs,
    portDs,
    endPointsDs,
    targetLabelsDs,
    modal,
    intl: {
      formatMessage,
    },
    networkId,
    appInstanceOptionsDs,
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

  function createPortGroup() {
    portDs.create();
  }

  function removePortGroup(record) {
    portDs.remove(record);
    portDs.validate();
  }

  function createEndPointGroup() {
    endPointsDs.create();
  }

  function removeEndPointGroup(record) {
    endPointsDs.remove(record);
    endPointsDs.validate();
  }

  function createTargetLabelGroup() {
    targetLabelsDs.create();
  }

  function removeTargetLabelGroup(record) {
    targetLabelsDs.remove(record);
    targetLabelsDs.validate();
  }

  function targetPortOptionRenderer({ record, text, value }) {
    return (
      <Tooltip title={value}>
        {value}
      </Tooltip>
    );
  }

  function targetPortOptionsFilter(record) {
    return !!record.get('portName');
  }

  function labelOptionRenderer({ record, text, value }) {
    return `${record.get('meaning')}`;
  }

  function appInstanceOptionRenderer({ record, text, value }) {
    const status = record.get('status');
    if (status) {
      return (
        <>
          <Tooltip
            title={formatMessage({ id: status })}
            placement="right"
          >
            <span className="c7ncd-network-instance-text">{text}</span>
          </Tooltip>
          { status !== 'running' && (
          <Tooltip title={formatMessage({ id: 'deleted' })} placement="top">
            <Icon type="error" className="c7ncd-instance-status-icon" />
          </Tooltip>
          )}
        </>
      );
    }
    return text;
  }

  function appInstanceRenderer({ value, text }) {
    const instance = appInstanceOptionsDs.find((r) => r.get('code') === value);

    if (instance && instance.get('status')) {
      const status = instance.get('status');
      return (
        <>
          <Tooltip
            title={formatMessage({ id: status })}
            placement="right"
          >
            <span className="c7ncd-network-instance-text">{text}</span>
          </Tooltip>
          { status !== 'running' && (
          <Tooltip title={formatMessage({ id: 'deleted' })} placement="top">
            <Icon type="error" className="c7ncd-instance-status-icon" />
          </Tooltip>
          )}
        </>
      );
    }
    return text;
  }

  function clearInputOption(record) {
    const meaning = record.get('meaning');
    return meaning && meaning.indexOf(':') >= 0;
  }

  function appServiceRenderer({ record, text, value }) {
    const serviceType = record.get('serviceType') || 'normal_service';
    let iconType = 'widgets';
    let message = 'project';
    if (serviceType === 'share_service') {
      iconType = 'share';
      message = 'share';
    }
    return (
      <div className="c7ncd-create-network-appService">
        <Tooltip title={formatMessage({ id: message })}>
          <Icon type={iconType} />
        </Tooltip>
        <span className="c7ncd-create-network-appService-text">{text}</span>
      </div>
    );
  }
  const handleClick = (val) => {
    formDs.current.set('isChart', val.isChart);
  };
  const chartType = [{ isChart: 'chart', content: 'chart应用' }, { isChart: 'deployment', content: '部署组应用' }];
  let targetForm = null;
  if (current) {
    if (current.get('target') === 'instance') {
      targetForm = (
        <>
          <div className="app-service-isChartType">
            <CustomSelect
              onClickCallback={(value) => handleClick(value)}
              data={chartType}
              identity="isChart"
              mode="single"
              customChildren={(item) => (
                <div className="app-service-isChart-content">
                  {item.content}
                </div>
              )}
            />
          </div>
          {current.get('isChart') === 'chart' ? (
            <>
              <Select
                name="appServiceId"
                colSpan={3}
                className="app-service-select"
                searchable
                optionRenderer={appServiceRenderer}
              />
              <Select name="appInstance" colSpan={3} className="app-instance-select" optionRenderer={appInstanceOptionRenderer} renderer={appInstanceRenderer} />
            </>
          ) : <Select name="appDeploy" colSpan={3} className="app-instance-select" optionRenderer={appInstanceOptionRenderer} renderer={appInstanceRenderer} />}

        </>
      );
    } else if (current.get('target') === 'param') {
      targetForm = (
        <div className="label-form">
          {
        map(targetLabelsDs.created, (record, index) => (
          <Form record={record} key={`target-label-record-${index}`} columns={4}>
            <Select name="keyword" combo optionRenderer={labelOptionRenderer} optionsFilter={clearInputOption} />
            <Icon className="network-group-icon" type="drag_handle" />
            <Select name="value" combo optionRenderer={labelOptionRenderer} optionsFilter={clearInputOption} />
            {
            targetLabelsDs.created.length > 1 ? (
              <Button
                colSpan={3}
                funcType="flat"
                icon="delete"
                onClick={removeTargetLabelGroup.bind(this, record)}
              />
            ) : <span colSpan={1} />
          }
          </Form>
        ))
      }
          <Button
            color="primary"
            funcType="flat"
            onClick={createTargetLabelGroup}
            icon="add"
          >
            {formatMessage({ id: 'network.config.addtarget' })}
          </Button>
        </div>
      );
    } else {
      targetForm = (
        <div className="endpoints-form" colSpan={3}>
          <TextField name="targetIps" colSpan={3} />
          {
            map(endPointsDs.created, (record, index) => (
              <div key={`endPort-record-${index}`} className="endpoints-group">
                <TextField record={record} name="targetPort" colSpan={3} />
                {
                endPointsDs.created.length > 1 ? (
                  <Button
                    colSpan={3}
                    funcType="flat"
                    icon="delete"
                    onClick={removeEndPointGroup.bind(this, record)}
                  />
                ) : <span colSpan={3} />
              }
              </div>
            ))
          }
          <Button
            color="primary"
            funcType="flat"
            onClick={createEndPointGroup}
            icon="add"
            className="endpoints-form-add"
          >
            {formatMessage({ id: 'network.config.addport' })}
          </Button>
        </div>
      );
    }
  }

  const networkName = (
    <Form dataSet={formDs} columns={3}>
      <TextField name="name" colSpan={3} maxLength={30} disabled={!!networkId} />
    </Form>
  );
  const colSpanType = { ClusterIP: 6, NodePort: 3, LoadBalancer: 4 };
  return (
    <>
      <div className="c7ncd-create-network">
        {
          networkId && networkName
        }
        <p className="network-panel-title">{formatMessage({ id: 'network.target' })}</p>

        <Form dataSet={formDs}>
          <div
            className="network-panel-target-select"
          >
            <SelectBox name="target">
              <Option value="instance"><span className="target-instance">{formatMessage({ id: 'network.target.application' })}</span></Option>
              <Option value="param"><span className="target-instance">{formatMessage({ id: 'network.target.param' })}</span></Option>
              <Option value="endPoints">Endpoints</Option>
            </SelectBox>
          </div>
          <div className="target-form">
            {targetForm}
          </div>
        </Form>

        <div className="hr" />
        <p className="network-panel-title">{formatMessage({ id: 'network.config' })}</p>

        <Form dataSet={formDs} columns={3}>
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
            map(portDs.created, (record, index) => (
              <Form record={record} key={`port-record-${index}`} columns={12}>

                {
                current.get('type') !== 'ClusterIP'
                  && <TextField name="nodePort" colSpan={colSpanType[current.get('type')]} />
              }
                <TextField name="port" colSpan={colSpanType[current.get('type')]} />
                <Select name="targetPort" combo optionRenderer={targetPortOptionRenderer} clearButton={false} optionsFilter={targetPortOptionsFilter} colSpan={colSpanType[current.get('type')]} />
                {
                current.get('type') === 'NodePort'
                && (
                <Select name="protocol" clearButton={false} colSpan={colSpanType[current.get('type')]}>
                  {map(['TCP', 'UDP'], (item) => (
                    <Option value={item} key={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
                )
              }
                {
                portDs.created.length > 1 && (
                  <Button
                    colSpan={3}
                    funcType="flat"
                    icon="delete"
                    className="c7ncd-form-record-delete-btn"
                    onClick={removePortGroup.bind(this, record)}
                  />
                )
              }
              </Form>
            ))
          }
          <Button
            color="primary"
            funcType="flat"
            onClick={createPortGroup}
            icon="add"
          >
            {formatMessage({ id: 'network.config.addport' })}
          </Button>
        </div>
        {
          !networkId && networkName
        }
      </div>
    </>
  );
}

export default observer(FormContent);
