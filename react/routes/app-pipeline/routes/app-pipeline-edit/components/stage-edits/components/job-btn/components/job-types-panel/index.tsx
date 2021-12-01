import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon } from '@choerodon/master';
import { Menu, Icon } from 'choerodon-ui';
import {} from 'choerodon-ui/pro';
import {} from '@choerodon/components';

import './index.less';

export type JobTypesPanelProps = {

}

const {
  SubMenu,
  Item,
} = Menu;

const prefixCls = 'c7ncd-job-types-panel';

const JobTypesPanel:FC<JobTypesPanelProps> = (props) => {
  const {

  } = props;

  const formatCommon = useFormatCommon();

  const handleClick = () => {

  };

  return (
    <Menu onClick={handleClick} style={{ width: 160 }} mode="vertical">
      <SubMenu
        key="sub4"
        title="name"
      >
        <Item key="9">Option 9</Item>
        <Item key="10">Option 10</Item>
        <Item key="11">Option 11</Item>
        <Item key="12">Option 12</Item>
      </SubMenu>
    </Menu>
  );
};

export default JobTypesPanel;
