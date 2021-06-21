import React, { useCallback, useMemo } from 'react';
import { runInAction } from 'mobx';
import { Button } from 'choerodon-ui/pro';
import { Permission } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';
import { C7NTabs } from '@choerodon/components';
import { useResourceStore } from '../../../stores';

import './index.less';

const SidebarHeader = () => {
  const {
    viewTypeMappings: {
      IST_VIEW_TYPE,
      RES_VIEW_TYPE,
    },
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const buttonProps = useMemo(() => ({
    disabled: treeDs.status === 'loading',
    color: 'primary',
    funcType: 'flat',
  }), [treeDs.status]);

  function handleChoose(choose) {
    runInAction(() => {
      resourceStore.changeViewType(choose);
      resourceStore.setSelectedMenu({});
      resourceStore.setExpandedKeys([]);
      resourceStore.setSearchValue('');
    });
  }

  function chooseInstance() {
    resourceStore.getViewType !== IST_VIEW_TYPE && handleChoose(IST_VIEW_TYPE);
  }

  function chooseResource() {
    resourceStore.getViewType !== RES_VIEW_TYPE && handleChoose(RES_VIEW_TYPE);
  }

  const handleChangeTabs = (key) => {
    if (key === IST_VIEW_TYPE) {
      chooseInstance();
    } else {
      chooseResource();
    }
  };

  return (
    <div className={`${prefixCls}-sidebar-head`}>
      <div style={{ position: 'relative', bottom: 11 }}>
        <C7NTabs
          driveRouteKey
          onChange={handleChangeTabs}
          tabs={[{
            tab: formatMessage({ id: `${intlPrefix}.viewer.${IST_VIEW_TYPE}` }),
            key: IST_VIEW_TYPE,
          }, {
            tab: formatMessage({ id: `${intlPrefix}.viewer.${RES_VIEW_TYPE}` }),
            key: RES_VIEW_TYPE,
          }]}
        />
      </div>
      {/* <Button */}
      {/*  {...buttonProps} */}
      {/*  onClick={chooseInstance} */}
      {/*  className={getViewType === IST_VIEW_TYPE ? `${prefixCls}-sidebar-active` : ''} */}
      {/* > */}
      {/*  {formatMessage({ id: `${intlPrefix}.viewer.${IST_VIEW_TYPE}` })} */}
      {/* </Button> */}
      {/* <Permission */}
      {/*  service={['choerodon.code.project.deploy.app-deployment.resource.ps.resource']} */}
      {/* > */}
      {/*  <Button */}
      {/*    {...buttonProps} */}
      {/*    onClick={chooseResource} */}
      {/*    className={getViewType === RES_VIEW_TYPE ? `${prefixCls}-sidebar-active` : ''} */}
      {/*  > */}
      {/*    {formatMessage({ id: `${intlPrefix}.viewer.${RES_VIEW_TYPE}` })} */}
      {/*  </Button> */}
      {/* </Permission> */}
    </div>
  );
};

export default SidebarHeader;
