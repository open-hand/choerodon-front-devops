import React from 'react';
import { runInAction } from 'mobx';
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
  } = useResourceStore();

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
    </div>
  );
};

export default SidebarHeader;
