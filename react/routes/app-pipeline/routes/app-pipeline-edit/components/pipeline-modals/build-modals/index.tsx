import React, { useRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';
import { StoreProvider } from './stores';
import Content from './content';
import { STEP_TEMPLATE, TASK_TEMPLATE } from '@/routes/app-pipeline/CONSTANTS';

let modal: any;

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
  title?: any,
) => {
  const { template } = data;
  function getTitle() {
    if (template && template === TASK_TEMPLATE) {
      return '创建任务模板';
    } if (template && template === STEP_TEMPLATE) {
      return '创建步骤模板';
    }
    return '添加【构建】阶段';
  }

  if (modal) {
    modal.close();
  }

  modal = Modal.open({
    title: title || getTitle(),
    drawer: true,
    className: 'c7ncd-buildModals',
    children: (
      <Index
        data={data}
        handleJobAddCallback={handleJobAddCallback}
        advancedData={advancedData}
        level={level}
      />
    ),
    mask: !!template,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MIDDLE,
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
