import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';
import { StoreProvider } from './stores';
import Content from './content';

const Index = observer((props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));

const handleBuildModal = (
  data: any,
  handleJobAddCallback: any,
  advancedData?: any,
  level?: any,
) => {
  Modal.open({
    title: '添加【构建】阶段',
    drawer: true,
    children: (
      <Index
        data={data}
        handleJobAddCallback={handleJobAddCallback}
        advancedData={advancedData}
        level={level}
      />
    ),
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    maskClosable: false,
    key: Modal.key(),
    footer: null,
  });
};

export default Index;

export {
  handleBuildModal,
};
