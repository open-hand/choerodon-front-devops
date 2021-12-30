import React from 'react';
import { OverflowWrap } from '@choerodon/components';
import { prefixCls } from './index';

type JobTemplateItemProps ={
  name: string
}

const JobTemplateItem = (props:JobTemplateItemProps) => {
  const {
    name: jobName,
  } = props;
  return (
    <div className={`${prefixCls}-jobTmp`}>
      <OverflowWrap width="80%">{jobName}</OverflowWrap>
    </div>
  );
};

export default JobTemplateItem;
