import React from 'react';
import { prefixCls } from './index';
import JobTemplateItem from './jobTemplateItem';

type StageTemplateItem ={
  ciTemplateJobVOList: any[]
}

const StageTemplate:any = (props:StageTemplateItem) => {
  const { ciTemplateJobVOList = [] } = props;

  const renderJobTmp = () => (ciTemplateJobVOList.map((item:any) => {
    const {
      id,
    } = item;
    return <JobTemplateItem key={id} {...item} />;
  }));

  return ciTemplateJobVOList.length ? (
    <div className={`${prefixCls}-stageTmp`}>
      {renderJobTmp()}
    </div>
  ) : '';
};

export default StageTemplate;
