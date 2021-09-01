import React, { useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui';

import './index.less';
import Tips from '@/components/new-tips';

const Index = ({
  title,
  content,
  style,
  helpText,
  defaultCollapse,
}: {
  title: string,
  content: any,
  style?: object,
  helpText?: string,
  defaultCollapse?: boolean,

}) => {
  const [collapse, setCollapse] = useState(defaultCollapse || false);

  const handleClickIcon = () => {
    setCollapse(!collapse);
  };

  return (
    <div
      className="c7ncd-collapseCon"
      style={style}
    >
      <div className="c7ncd-collapseCon__header">
        <span
          role="none"
          className="c7ncd-collapseCon__header__icon"
          onClick={handleClickIcon}
        >
          <Icon
            type={collapse ? 'expand_less' : 'expand_more'}
            style={{
              color: '#5365EA',
            }}
          />
        </span>
        <span className="c7ncd-collapseCon__header__title">
          {title}
        </span>
        {
          helpText && (
            <span style={{
              marginLeft: 4,
              position: 'relative',
              bottom: 2,
            }}
            >
              <Tips helpText={helpText} />
            </span>
          )
        }
      </div>
      {
        !collapse && (
          <div className="c7ncd-collapseCon__content">
            { content}
          </div>
        )
      }
    </div>
  );
};

Index.defaultProps = {
  style: {},
  helpText: '',
  defaultCollapse: false,
};

export default Index;
