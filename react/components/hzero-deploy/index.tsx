import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import Content from './Content';
import { LARGE } from '@/utils/getModalWidth';

const hzeroDeployModalKey = Modal.key();

interface Props {
  syncStatus: { open: boolean, sass: boolean },
  refresh(): void,
}

type headerBtnsHzeroProps = {
  syncStatus: any
  refresh:(...args:any[])=>any
}

const HzeroDeploy = (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default HzeroDeploy;

export const openHzeroDeploy = ({
  refresh,
  syncStatus,
}:headerBtnsHzeroProps) => {
  Modal.open({
    key: hzeroDeployModalKey,
    style: {
      width: LARGE,
    },
    title: '创建HZERO应用',
    children: <HzeroDeploy
      syncStatus={syncStatus}
      refresh={refresh}
    />,
    drawer: true,
    okText: '创建',
  });
};

export const getHzeroDeployBtnConfig = ({
  refresh,
  hasMarket,
  syncStatus,
}:headerBtnsHzeroProps & {
  hasMarket: boolean
}):any => ({
  name: '创建HZERO应用',
  icon: 'cloud_done-o',
  display: hasMarket,
  disabled: !(syncStatus.open || syncStatus.sass),
  permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.hzero'],
  handler: () => {
    openHzeroDeploy({
      syncStatus,
      refresh,
    });
  },
  tooltipsConfig: {
    title: !(syncStatus.open || syncStatus.sass) ? '未从开放平台同步HZERO应用至C7N平台，无法执行此操作' : '',
  },
});
