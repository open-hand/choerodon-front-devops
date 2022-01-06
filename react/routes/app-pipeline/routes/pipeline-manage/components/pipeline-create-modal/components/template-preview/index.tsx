import React, {
  useEffect, FC, useState,
} from 'react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import {} from 'choerodon-ui/pro';
import { StatusTag } from '@choerodon/components';
import classNames from 'classnames';
import cutomizeImg from '../../assets/cutomize.png';

import './index.less';
import StageTemplate from './StageTemplate';

export type TemplatePreviewProps = {
  name:string
  id:string
  showCustomizeTag:boolean
  ciTemplateStageVOList: any[]
  cdTemplateStageVOList:any[]
  isActive?:boolean
  handleSelect?:(data:any)=>void
  ciTemplateCategoryDTO:{
    image:string
  }
}

export const prefixCls = 'c7ncd-template-preview';
export const intlPrefix = 'c7ncd.template.preview';

const TemplatePreview:FC<TemplatePreviewProps> = (props) => {
  const {
    name,
    ciTemplateCategoryDTO = { image: '' },
    ciTemplateStageVOList = [],
    cdTemplateStageVOList = [],
    isActive,
    showCustomizeTag,
    handleSelect,
  } = props;

  const formatCommon = useFormatCommon();
  const formatTemplatePreview = useFormatMessage(intlPrefix);

  const stagesData = ciTemplateStageVOList.concat(cdTemplateStageVOList);

  const cls = classNames(prefixCls, {
    [`${prefixCls}-active`]: isActive,
  });

  const renderStages = () => (stagesData.length ? stagesData.map((item) => {
    const { id: jobTmpId } = item;
    return <StageTemplate key={jobTmpId} {...item} />;
  }) : '');

  const handleClick = () => {
    handleSelect?.({ ...props });
  };

  return (
    <div className={cls} onClick={handleClick} role="none">
      <header>
        <img src={ciTemplateCategoryDTO?.image || cutomizeImg} alt="img" />
        <span className={`${prefixCls}-name`}>{name}</span>
        {showCustomizeTag && <StatusTag className={`${prefixCls}-tag`} name="自定义" colorCode="operating" type="border" />}
      </header>
      <main>
        {renderStages()}
      </main>
    </div>
  );
};

export default TemplatePreview;
