/* eslint-disable max-len */
import React, {
  FC, useMemo, useState, useEffect,
} from 'react';
import { useFormatCommon } from '@choerodon/master';
import { DataSet } from 'choerodon-ui/pro';
import map from 'lodash/map';

import './index.less';
import { Loading } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import PipelineTemplatesDataSet from '../../stores/PipelineTemplatesDataSet';
import TemplatePreview from '../template-preview';
import { DEFAULT_TMP, DEFAULT_TMP_ID } from '../../stores/CONSTANTS';

export type TemplatesSelectorProps = {
  handleSelectTmpCallback:(tempData:any)=>void
}

type MenuItemTypes= {
  category:string
  id:string |number
  image:string
}

const prefixCls = 'c7ncd-templates-selector';

const TemplatesSelector:FC<TemplatesSelectorProps> = (props) => {
  const formatCommon = useFormatCommon();
  const {
    handleSelectTmpCallback,
  } = props;

  const [selectedMenuId, setSelectedMenuId] = useState<string | number>('');
  const [selectedTmpId, setSelectedTmpId] = useState<string|number>('');

  const templatesDs = useMemo(() => new DataSet(PipelineTemplatesDataSet()), []);

  const record = templatesDs.current as any;

  const ciTemplateCategoryDTOList = record?.get('ciTemplateCategoryDTOList');
  const pipelineTemplateVOList = record?.get('pipelineTemplateVOList');

  useEffect(() => {
    if (ciTemplateCategoryDTOList?.length) {
      const { id } = ciTemplateCategoryDTOList[0];
      setSelectedMenuId(id);
    }
    setSelectedTmpId(DEFAULT_TMP_ID);
  }, [ciTemplateCategoryDTOList]);

  /**
   * 选中当前的menu之后会自动滚动到右侧对应的section单元
   *
   * @param {(string|number)} selected
   */
  const handleMenuSelect = (selected:string|number) => {
    const doms = document.querySelectorAll('section[data-categoryKey]');
    doms.forEach((dom:any) => {
      if (String(dom.dataset?.categorykey) === String(selected)) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }
    });
    setSelectedMenuId(selected);
  };

  /**
   * 渲染菜单
   *
   */
  const renderMenuItems = () => ciTemplateCategoryDTOList?.map((item:MenuItemTypes) => {
    const {
      id, image, category,
    } = item;
    const cls = classNames(`${prefixCls}-menu-item`, {
      [`${prefixCls}-menu-item-active`]: id === selectedMenuId,
    });
    return (
      <div
        className={cls}
        key={id}
        onClick={() => handleMenuSelect(id)}
        role="none"
      >
        <div className={`${prefixCls}-menu-item-image-container`}>
          <img src={image} alt="" />
        </div>
        <span>{category}</span>
      </div>
    );
  });

  /**
   * 选模板的回调函数
   */
  const handleSelectTmp = (tmpData:any) => {
    const { id } = tmpData || {};
    setSelectedTmpId(id);
    handleSelectTmpCallback(id);
  };

  /** @type {Object} 根据后台数据筛选出分类数组 */
  const getSectionGroup = useMemo(() => {
    const sectionGroup:Record<string, any[]> = {};
    const tmpLists = [DEFAULT_TMP, ...(pipelineTemplateVOList || []).slice()];
    tmpLists?.forEach((item:{ciTemplateCategoryId:string}) => {
      const { ciTemplateCategoryId } = item;
      if (!(ciTemplateCategoryId in sectionGroup)) sectionGroup[ciTemplateCategoryId] = [];
      sectionGroup[ciTemplateCategoryId].push(item);
    });
    return sectionGroup;
  }, [pipelineTemplateVOList]);

  /**
   * 渲染模板分组
   */
  const renderSection = () => map(getSectionGroup, (array:any[], key:string) => (
    <section key={key} data-categoryKey={key}>
      {renderContainerItems(array)}
    </section>
  ));

  /**
   *  遍历模板
   * @param {any[]} array
   */
  const renderContainerItems = (array:any[]) => array?.map((item) => {
    const {
      id: tmpId,
    } = item;

    return (
      <TemplatePreview
        {...item}
        key={tmpId}
        isActive={tmpId === selectedTmpId}
        handleSelect={handleSelectTmp}
      />
    );
  });

  if (templatesDs.status === 'loading') {
    return <Loading type="c7n" />;
  }

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-menu`}>
        {renderMenuItems()}
      </div>
      <div className={`${prefixCls}-container`}>
        {renderSection()}
      </div>
    </div>
  );
};

export default observer(TemplatesSelector);
