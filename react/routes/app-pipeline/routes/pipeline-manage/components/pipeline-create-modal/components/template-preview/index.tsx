import React, {
  useEffect, FC, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import {} from 'choerodon-ui/pro';
import {} from '@choerodon/components';
import classNames from 'classnames';
import appImg from '@/images/app.svg';

import './index.less';
import StageTemplate from './StageTemplate';

export type TemplatePreviewProps = {
  name:string
  image:string
  id:string
  ciTemplateStageVOList: any[]
  cdTemplateStageVOList:any[]
  isActive?:boolean
  handleSelect?:(data:any)=>void
}

export const prefixCls = 'c7ncd-template-preview';
export const intlPrefix = 'c7ncd.template.preview';

const TemplatePreview:FC<TemplatePreviewProps> = (props) => {
  const {
    name,
    id,
    image,
    ciTemplateStageVOList = [],
    cdTemplateStageVOList = [],
    isActive,
    handleSelect,
  } = props;

  const formatCommon = useFormatCommon();
  const formatTemplatePreview = useFormatMessage(intlPrefix);

  const stagesData = ciTemplateStageVOList.concat(cdTemplateStageVOList);

  const cls = classNames(prefixCls, {
    [`${prefixCls}-active`]: isActive,
  });

  const renderStages = () => stagesData.map((item) => {
    const { id: jobTmpId } = item;
    return <StageTemplate key={jobTmpId} {...item} />;
  });

  const handleClick = () => {
    handleSelect?.({ ...props });
  };

  return (
    <div className={cls} onClick={handleClick} role="none">
      <header>
        <img src={appImg} alt="img" />
        <span>{name}</span>
      </header>
      <main>
        {renderStages()}
      </main>
    </div>
  );
};

export default TemplatePreview;
