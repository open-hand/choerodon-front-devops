import { Table } from 'choerodon-ui/pro';
import React, { useEffect } from 'react';

import { usePipelineTriggerNumberStore } from '../../stores';

const { Column } = Table;

const MyTable = () => {
  const {
    pipelineTableDs,
    prefixCls,
  } = usePipelineTriggerNumberStore();
  useEffect(() => {

  }, []);
  return (
    <Table dataSet={pipelineTableDs} queryBar="none" className={`${prefixCls}-table`}>
      <Column name="status" />
      <Column name="code" />
      <Column name="name" />
      <Column name="stages" />
      <Column name="appservice" />
      <Column name="startDate" />
      <Column name="durations" />
      <Column name="user" />
    </Table>
  );
};

export default MyTable;
