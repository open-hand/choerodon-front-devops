/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import {
  Page, Header, Content, Breadcrumb,
} from '@choerodon/boot';
import { Button, Form, Select } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import TimePicker from '../Component/TimePicker';
import ChartSwitch from '../Component/ChartSwitch';
import MyTable from './components/Table';

import { usePipelineTriggerNumberStore } from './stores';
import { useReportsStore } from '../stores';

import './index.less';
import Chart from './components/Chart';

const { Option } = Select;

const PipelineTriggerNumber = () => {
  const {
    intl: { formatMessage },
    history,
    history: {
      location: { state, search },
    },
    prefixCls,
    pipelineSelectDs,
    mainStore,
  } = usePipelineTriggerNumberStore();

  const [dateType, setDateType] = useState('seven');

  const handleDateChoose = (type) => {
    setDateType(type);
  };

  const { ReportsStore } = useReportsStore();

  useEffect(() => {}, []);

  const handleRefresh = () => {};

  const loadCharts = () => {

  };

  const handlePipelineSelect = (value, oldValue) => {
    mainStore.setSelectedPipeline(value);
  };

  const renderForm = () => (
    <div className={`${prefixCls}-form`}>
      <Form
        className={`${prefixCls}-form-content`}
      >
        <Select
          label="应用流水线"
          filter
          searchable
          onChange={handlePipelineSelect}
          clearButton={false}
        >
          {
            pipelineSelectDs.map((record) => <Option value={record.get('value')}>{record.get('name')}</Option>)
          }
        </Select>
      </Form>
      <TimePicker
        startTime={ReportsStore.getStartDate}
        endTime={ReportsStore.getEndDate}
        func={loadCharts}
        type={dateType}
        onChange={handleDateChoose}
        store={ReportsStore}
      />
    </div>
  );

  const renderContent = () => (
    <>
      {renderForm()}
      <Chart ReportsStore={ReportsStore} />
      <MyTable />
    </>
  );

  return (
    <Page className={prefixCls} service={[]}>
      <Header
        title={formatMessage({ id: 'report.pipelineTrigger-number.head' })}
        backPath={`/charts${search}`}
      >
        <ChartSwitch history={history} current="pipelineTrigger-number" />
        <Button icon="refresh" onClick={handleRefresh}>
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Breadcrumb
        title={formatMessage({ id: 'report.pipelineTrigger-number.head' })}
      />
      <Content className={`${prefixCls}-content`}>{renderContent()}</Content>
    </Page>
  );
};

export default observer(PipelineTriggerNumber);
