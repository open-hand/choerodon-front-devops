import React, { useState } from 'react';
import { Icon } from 'choerodon-ui';

import './index.less';

const Index = ({
  title,
  content,
  style,
}: {
  title: string,
  content: any,
  style?: object,
}) => {
  const [collapse, setCollapse] = useState(false);

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
          />
        </span>
        <span className="c7ncd-collapseCon__header__title">
          {title}
        </span>
      </div>
      {
        !collapse && content
      }
    </div>
  );
};

Index.defaultProps = {
  style: {},
};

export default Index;
