/* eslint-disable max-len */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Page, Header, Content, Breadcrumb,
} from '@choerodon/master';
import { Button, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Loading } from '@choerodon/components';
import PipelineTable from '@/routes/reports/pipeline-duration/components/table';
import TimePicker from '../Component/TimePicker';
import NoChart from '../Component/NoChart';
import HeaderButtons from '../Component/HeaderButtons';
import { usePipelineTriggerNumberStore } from './stores';
import { useReportsStore } from '../stores';
import Chart from './components/Chart';

import './index.less';

const { Option } = Select;

const PipelineTriggerNumber = () => {
  const {
    intl: { formatMessage },
    history,
    history: {
      location: { search },
    },
    prefixCls,
    pipelineSelectDs,
    mainStore,
    pipelineChartDs,
    pipelineTableDs,
  } = usePipelineTriggerNumberStore();

  const [dateType, setDateType] = useState('seven');

  const handleDateChoose = (type) => {
    setDateType(type);
  };

  const { ReportsStore } = useReportsStore();

  useEffect(() => {}, []);

  const handleRefresh = () => {
    pipelineTableDs.query();
    pipelineChartDs.query();
  };

  const loadCharts = () => {

  };

  const handlePipelineSelect = (value, oldValue) => {
    mainStore.setSelectedPipeline(value);
  };

  const renderForm = useCallback(() => (
    <div className={`${prefixCls}-form`}>
      <Form
        className={`${prefixCls}-form-content`}
      >
        <Select
          label="应用流水线"
          filter
          searchable
          value={mainStore.selectedPipelineId}
          onChange={handlePipelineSelect}
          clearButton={false}
        >
          {
            pipelineSelectDs.map((record) => <Option value={record.get('id')}>{record.get('name')}</Option>)
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
  ), [dateType, pipelineSelectDs]);

  const renderContent = () => {
    if (pipelineSelectDs.status === 'loading') {
      return <Loading display type="c7n" />;
    }
    if (!pipelineSelectDs.length) {
      return <NoChart getProRole={ReportsStore.getProRole} type="pipeline" />;
    }
    return (
      <>
        {renderForm()}
        <Chart />
        <PipelineTable tableDs={pipelineTableDs} />
      </>
    );
  };

  return (
    <Page
      className={prefixCls}
    >
      <Header
        title={formatMessage({ id: 'report.pipelineTrigger-number.head' })}
      >
        <HeaderButtons
          refresh={handleRefresh}
          reportKey="pipelineTrigger-number"
          reportType="develop"
        />
      </Header>
      <Breadcrumb
        title={formatMessage({ id: 'report.pipelineTrigger-number.head' })}
      />
      <Content className={`${prefixCls}-content`}>{renderContent()}</Content>
    </Page>
  );
};

export default observer(PipelineTriggerNumber);
