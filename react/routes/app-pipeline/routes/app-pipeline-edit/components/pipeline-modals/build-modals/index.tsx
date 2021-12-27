import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';
import { StoreProvider } from './stores';
import Content from './content';
import { TASK_TEMPLATE } from '@/routes/app-pipeline/CONSTANTS';

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
  const { template } = data;

  function getTitle() {
    if (template && template === TASK_TEMPLATE) {
      return '创建任务模板';
    }
    return '添加【构建】阶段';
  }

  Modal.open({
    title: getTitle(),
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
    footer: !template ? null : (okbtn: any, cancelbtn: any) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
  });
};

export default Index;

export {
  handleBuildModal,
};
