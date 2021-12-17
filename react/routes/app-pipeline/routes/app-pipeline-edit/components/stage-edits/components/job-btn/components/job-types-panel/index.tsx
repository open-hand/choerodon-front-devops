import React, {
  useEffect, FC, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { Loading } from '@choerodon/components';
import { useFormatCommon } from '@choerodon/master';
import { Menu, Icon } from 'choerodon-ui';
import { handleBuildModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals';
<<<<<<< HEAD
import { handleCustomModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/custom-modal';
import { BUILD, CUSTOM } from '@/routes/app-pipeline/CONSTANTS';
=======
>>>>>>> [ADD] add
import {} from 'choerodon-ui/pro';

import './index.less';
import useGetJobPanel from '../../../../hooks/useGetJobPanel';
import { templateJobsApi } from '@/api/template-jobs';

export type JobTypesPanelProps = {

}

const {
  SubMenu,
  Item,
} = Menu;

const prefixCls = 'c7ncd-job-types-panel';

const JobTypesPanel:FC<JobTypesPanelProps> = (props) => {
  const panels = useGetJobPanel();
  const [currentSelectedSubMenuId, setSubMenuId] = useState('');

  const getSubMenuChild = ({ queryKey }:any) => {
    const [_key, subMenuId] = queryKey;
    return templateJobsApi.getJobByGroupId(subMenuId);
  };

  const { data: childrenMenus, isLoading, isFetching } = useQuery(['sub-menu-child', currentSelectedSubMenuId], getSubMenuChild);

  const formatCommon = useFormatCommon();

  const handleClick = (data: any) => {
    const { keyPath } = data;
    console.log(keyPath);
  };

  const renderChildrenMenu = ({ parentId }:{
    parentId:string
  }) => {
    if (String(parentId) !== String(currentSelectedSubMenuId)) {
      return null;
    }
    if (isLoading || isFetching) {
      return <Loading type="c7n" style={{ height: '50px' }} />;
    }
    if (!childrenMenus.length) {
      return (
        <div className={`${prefixCls}-subMenu-empty`}>
          {formatCommon({ id: 'nodata' })}
        </div>
      );
    }
    return childrenMenus?.map(({
      id, name,
    }:any) => (
      <Item key={id}>
        {name}
      </Item>
    ));
  };

  const renderSubMenus = () => panels?.map((item) => {
    const { id, name, type } = item;
    return (
      <SubMenu
        key={id}
        title={name}
        onTitleClick={({ key }:any) => {
          setSubMenuId(key);
        }}
        className={`${prefixCls}-subMenu`}
      >
        {renderChildrenMenu({ parentId: id })}
      </SubMenu>
    );
  });

  return (
    <Menu onClick={handleClick} style={{ width: 160 }} mode="vertical">
      {renderSubMenus()}
    </Menu>
  );
};

export default JobTypesPanel;
