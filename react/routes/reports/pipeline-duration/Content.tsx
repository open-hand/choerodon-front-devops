/* eslint-disable max-len */
import React, {
  useCallback, useState,
} from 'react';
import {
  Page, Header, Content, Breadcrumb,
} from '@choerodon/boot';
import { Button, Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Loading } from '@choerodon/components';
import MaxTagPopover from '@/routes/reports/Component/MaxTagPopover';
import TimePicker from '../Component/TimePicker';
import NoChart from '../Component/NoChart';
import HeaderButtons from '../Component/HeaderButtons';
import PipelineTable from './components/table';
import { usePipelineDurationStore } from './stores';
import { useReportsStore } from '../stores';
import Chart from './components/chart';

import './index.less';

const PipelineTriggerDuration = () => {
  const {
    formatMessage,
    history,
    history: {
      location: { search },
    },
    prefixCls,
    intlPrefix,
    selectDs,
    tableDs,
    chartDs,
    optionsDs,
  } = usePipelineDurationStore();

  const [dateType, setDateType] = useState('seven');

  const handleDateChoose = (type: string) => {
    setDateType(type);
  };

  const { ReportsStore } = useReportsStore();

  const handleRefresh = useCallback(() => {
    optionsDs.query();
    chartDs.query();
    tableDs.query();
  }, []);

  const loadCharts = useCallback(() => {
    const startTime = ReportsStore.getStartTime.format('YYYY-MM-DD HH:mm:ss');
    const endTime = ReportsStore.getEndTime.format('YYYY-MM-DD HH:mm:ss');
    chartDs.setQueryParameter('startTime', startTime);
    chartDs.setQueryParameter('endTime', endTime);
    tableDs.setQueryParameter('startTime', startTime);
    tableDs.setQueryParameter('endTime', endTime);
    chartDs.query();
    tableDs.query();
  }, [ReportsStore.getStartTime, ReportsStore.getEndTime]);

  // @ts-ignore
  const maxTagNode = useCallback((value) => <MaxTagPopover dataSource={optionsDs.toData()} value={value} />, [optionsDs.records]);

  const renderContent = () => {
    if (optionsDs.status === 'loading') {
      return <Loading display type="c7n" />;
    }
    if (!optionsDs.length) {
      // @ts-ignore
      return <NoChart getProRole={ReportsStore.getProRole} type="pipeline" />;
    }
    return (
      <>
        <div className={`${prefixCls}-form`}>
          <Form
            dataSet={selectDs}
            className={`${prefixCls}-form-content`}
          >
            <Select
              name="pipelineIds"
              searchable
              clearButton={false}
              maxTagCount={3}
              maxTagPlaceholder={maxTagNode}
            />
          </Form>
          <TimePicker
            // @ts-ignore
            startTime={ReportsStore.getStartDate}
            endTime={ReportsStore.getEndDate}
            func={loadCharts}
            type={dateType}
            onChange={handleDateChoose}
            store={ReportsStore}
          />
        </div>
        <Chart />
        <PipelineTable tableDs={tableDs} />
      </>
    );
  };

  return (
    <Page
      className={prefixCls}
    >
      <Header
        title={formatMessage({ id: `${intlPrefix}.title` })}
      >
        <HeaderButtons
          refresh={handleRefresh}
          reportKey="pipeline-duration"
          reportType="develop"
        />
      </Header>
      <Breadcrumb
        title={formatMessage({ id: 'report.pipeline-duration.head' })}
      />
      <Content className={`${prefixCls}-content`}>{renderContent()}</Content>
    </Page>
  );
};

export default observer(PipelineTriggerDuration);
