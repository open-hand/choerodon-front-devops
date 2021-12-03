import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import {} from 'choerodon-ui/pro';
import {} from '@choerodon/components';

import './index.less';

export type TemplatesSelectorProps = {

}

const prefixCls = 'c7ncd-templates-selector';

const TemplatesSelector:FC<TemplatesSelectorProps> = (props) => {
  const {

  } = props;

  const formatCommon = useFormatCommon();

  const renderTemplate = () => {

  };

  const renderMenuItems = () => [
    <div className={`${prefixCls}-menu-item`}>
      <img />
      <span>Java</span>
    </div>,
    <div className={`${prefixCls}-menu-item ${prefixCls}-menu-item-select`}>
      <img />
      <span>Node.js</span>
    </div>,
  ];

  const renderContainerItems = () => [
    <section>
      <div className={`${prefixCls}-container-item`}>
        dsadas
      </div>
      <div className={`${prefixCls}-container-item`}>
        dsadas
      </div>
    </section>,
    <section>
      <div className={`${prefixCls}-container-item`}>
        dsadas
      </div>
      <div className={`${prefixCls}-container-item`}>
        dsadas
      </div>
    </section>,
  ];

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-menu`}>
        {renderMenuItems()}
      </div>
      <div className={`${prefixCls}-container`}>
        {renderContainerItems()}
      </div>
    </div>
  );
};

export default TemplatesSelector;
