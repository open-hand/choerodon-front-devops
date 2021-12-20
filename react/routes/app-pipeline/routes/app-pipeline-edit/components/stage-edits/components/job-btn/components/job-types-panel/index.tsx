import React, {
  useEffect, FC, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from 'react-query';
import { Loading } from '@choerodon/components';
import { useFormatCommon } from '@choerodon/master';
import { Menu, Icon } from 'choerodon-ui';
import { handleBuildModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals';
import { handleCustomModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/custom-modal';
import { BUILD, CUSTOM } from '@/routes/app-pipeline/CONSTANTS';
import {} from 'choerodon-ui/pro';

import './index.less';
import useGetJobPanel from '../../../../hooks/useGetJobPanel';
import { templateJobsApi } from '@/api/template-jobs';
import useTabData from '@/routes/app-pipeline/routes/app-pipeline-edit/hooks/useTabData';
import { TAB_BASIC } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';

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
  const [,, getTabData] = useTabData();

  const getSubMenuChild = ({ queryKey }:any) => {
    const [_key, subMenuId] = queryKey;
    return templateJobsApi.getJobByGroupId(subMenuId);
  };

  const { data: childrenMenus, isLoading, isFetching } = useQuery(['sub-menu-child', currentSelectedSubMenuId], getSubMenuChild, {
    enabled: !!currentSelectedSubMenuId,
  });

  const formatCommon = useFormatCommon();

  const handleClick = (data: any) => {
    const { keyPath } = data;
    const stepData = JSON.parse(keyPath[0]);
    // switch (stepData.type) {
    //   case MAVEN_BUILD: {
    //     handleBuildModal(stepData);
    //     break;
    //   }
    //   default: {
    //     break;
    //   }
    // }
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
    if (!childrenMenus?.length) {
      return (
        <div className={`${prefixCls}-subMenu-empty`}>
          {formatCommon({ id: 'nodata' })}
        </div>
      );
    }
    return childrenMenus?.map((item:any) => {
      const {
        id, name,
      } = item;
      const concatItem = {
        ...item,
        ...getTabData(TAB_BASIC),
      };
      return (
        <Item key={JSON.stringify(concatItem)}>
          {name}
        </Item>
      );
    });
  };

  const renderSubMenus = () => panels?.map((item) => {
    const { id, name, type } = item;
    return (
      <SubMenu
        key={JSON.stringify(item)}
        title={name}
        onTitleClick={() => {
          setSubMenuId(id);
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
