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
    <OverflowWrap className={`${prefixCls}-jobTmp`}>
      {jobName}
    </OverflowWrap>
  );
};

export default JobTemplateItem;
