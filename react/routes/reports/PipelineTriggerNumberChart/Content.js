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
    pipelineDs,
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

  const renderForm = () => (
    <div className={`${prefixCls}-form`}>
      <Form
        dataSet={pipelineDs}
        className={`${prefixCls}-form-content`}
      >
        <Select
          name="triggerNumber"
          // optionFilterProp="children"
          // filterOption={(input, option) => option.props.children.props.children.props.children
          //   .toLowerCase()
          //   .indexOf(input.toLowerCase()) >= 0}
          filter
          searchable
          // onChange={handleAppSelect}
          clearButton={false}
        >
          <Option value="hello">helloo</Option>
          <Option value="sasas">hesaslloo</Option>
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
