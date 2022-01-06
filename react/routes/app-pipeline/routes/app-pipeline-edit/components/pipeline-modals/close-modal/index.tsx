import React from 'react';
import { Icon } from 'choerodon-ui';

import './index.less';

const prefix = 'c7ncd-closeModal';

const Index = (props: any) => {
  const {
    modal,
    preCheck,
  } = props;

  const handleClick = async () => {
    let result = true;
    if (preCheck) {
      result = await preCheck();
    }
    result && modal && modal.close();
  };

  return (
    <p
      role="none"
      className={`${prefix}__p`}
      onClick={handleClick}
    >
      <Icon type="last_page" />
      隐藏详情
    </p>
  );
};

export default Index;
