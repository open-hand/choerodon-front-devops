import React from 'react';
import { prefixCls } from './index';

type JobTemplateItem ={
  name: string
}

const JobTemplateItem = (props:JobTemplateItem) => {
  const {
    name: jobName,
  } = props;
  return (
    <div className={`${prefixCls}-jobTmp`}>
      {jobName}
    </div>
  );
};

export default JobTemplateItem;
