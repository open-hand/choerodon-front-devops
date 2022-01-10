import React, {
  FC, useState,
} from 'react';
import { useQuery } from 'react-query';
import { Loading } from '@choerodon/components';
import { useFormatCommon } from '@choerodon/master';
import { Menu } from 'choerodon-ui';
import { handleBuildModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals';
import { handleCustomModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/custom-modal';
import {
  MAVEN_BUILD,
} from '@/routes/app-pipeline/CONSTANTS';
import {} from 'choerodon-ui/pro';

import './index.less';
import useGetJobPanel from '../../../../hooks/useGetJobPanel';
import { templateJobsApi } from '@/api/template-jobs';
import useTabData from '@/routes/app-pipeline/routes/app-pipeline-edit/hooks/useTabData';
import { TAB_BASIC, TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

export type JobTypesPanelProps = {
  handleJobAddCallback:(addonData: any)=>(editData:any)=>void
}

const {
  SubMenu,
  Item,
} = Menu;

const handlePipelineModal = ({
  data,
  callback,
  advancedData,
  level,
  title,
  modalProps,
}: any) => {
  switch (level) {
    case 'project': {
      if (data?.type === MAVEN_BUILD) {
        handleBuildModal(data, callback, advancedData, level, title, modalProps);
      } else {
        handleCustomModal(data, callback, title);
      }
      break;
    }
    default: {
      handleBuildModal(data, callback, advancedData, level, title, modalProps);
    }
  }
};

const prefixCls = 'c7ncd-job-types-panel';

const JobTypesPanel:FC<JobTypesPanelProps> = (props: { handleJobAddCallback: any; }) => {
  const {
    handleJobAddCallback,
  } = props;
  const panels = useGetJobPanel();
  const [currentSelectedSubMenuId, setSubMenuId] = useState('');
  const [_data, _setdata, getTabData] = useTabData();

  const {
    level,
    jobPanelApiCallback,
  } = usePipelineContext();

  const getSubMenuChild = ({ queryKey }:any) => {
    const [_key, subMenuId] = queryKey;
    if (level === 'project') {
      return templateJobsApi.getJobByGroupId(subMenuId);
    }
    return jobPanelApiCallback?.(subMenuId);
  };

  const { data: childrenMenus, isLoading, isFetching } = useQuery(['sub-menu-child', currentSelectedSubMenuId], getSubMenuChild, {
    enabled: !!currentSelectedSubMenuId,
  });

  const formatCommon = useFormatCommon();

  const handleClick = (data: any) => {
    const { keyPath } = data;
    const stepData = JSON.parse(keyPath[0]);
    handlePipelineModal({
      data: stepData,
      callback: handleJobAddCallback(stepData),
      advancedData: getTabData(TAB_ADVANCE_SETTINGS),
      level,
    });
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
      let concatItem = item;
      if (level === 'project') {
        concatItem = {
          ...item,
          ...getTabData(TAB_BASIC),
        };
      }
      return (
        <Item key={JSON.stringify(concatItem)}>
          {name}
        </Item>
      );
    });
  };

  const renderSubMenus = () => panels?.map((item: { id: any; name: any; type: any; }) => {
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

export { handlePipelineModal };
