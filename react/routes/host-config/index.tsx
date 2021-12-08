import React from 'react';
import { mount, has } from '@choerodon/inject';
import { useTabActiveKey, CustomTabs } from '@choerodon/components';
import { Permission, useFormatMessage } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './Content';

import './index.less';

const tabKeys = {
  DEPLOY_TAB: 'deploy',
  TEST_TAB: 'test',
};
const testHostCode = 'test-pro:host-config';

const HostConfigIndex = (props: any) => {
  const format = useFormatMessage('c7ncd.resource');
  const [activeKey, setActiveKey] = useTabActiveKey(tabKeys.DEPLOY_TAB);
  // TODO 添加测试主机相关权限集
  const tabComponent = (
    <Permission service={['choerodon.code.project.test.manager.ps.api.default']}>
      {(hasPermission: boolean) => (
        hasPermission && (
          <CustomTabs
            onChange={(
              e: React.MouseEvent<HTMLDivElement, MouseEvent>, tabName: string, tabKey: string,
            ) => setActiveKey(tabKey)}
            data={[{
              name: format({ id: 'HostforDeployment' }),
              value: tabKeys.DEPLOY_TAB,
            }, {
              name: format({ id: 'HostforTest' }),
              value: tabKeys.TEST_TAB,
            }]}
            selectedTabValue={activeKey}
            className="c7ncd-host-config-content-tab"
          />
        )
      )}
    </Permission>
  );

  return (
    <>
      {activeKey === tabKeys.DEPLOY_TAB && (
        <DeployHostIndex
          {...props}
          tab={tabComponent}
          hasExtraTab={has(testHostCode)}
        />
      )}
      {activeKey === tabKeys.TEST_TAB && mount(testHostCode, {
        ...props,
        tab: tabComponent,
      })}
    </>
  );
};

const DeployHostIndex = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default HostConfigIndex;
