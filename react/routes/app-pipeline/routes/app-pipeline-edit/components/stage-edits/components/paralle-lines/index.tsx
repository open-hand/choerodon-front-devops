import React from 'react';

const prefixCls = 'c7ncd-pipeline-jobItem';

const ParalleLines = () => (
  <div className={`${prefixCls}-parallelLines`}>
    <div className={`${prefixCls}-parallelLines-left`}>
      <span className={`${prefixCls}-circle`} />
    </div>
    <div className={`${prefixCls}-parallelLines-right`}>
      <span className={`${prefixCls}-circle`} />
    </div>
  </div>
);

export default ParalleLines;
