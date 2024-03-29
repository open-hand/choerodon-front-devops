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
  modalProps?: any,
) => {
  const { template } = data;
  const newData = data;
  // 这里是设置一个值来保存老image值 为了在更新image后 还能选到老值
  if (!newData?.oldImage) {
    newData.oldImage = newData?.image;
  }
  function getTitle() {
    if (template && template === TASK_TEMPLATE) {
      return '创建任务模板';
    } if (template && template === STEP_TEMPLATE) {
      return '创建步骤模板';
    }
    return '添加【构建】任务';
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
      ...template ? {} : {
        height: 'calc(100% - 48px)',
        top: '48px',
      },
    },
    maskClosable: false,
    key: Modal.key(),
    footer: !template ? null : (okbtn: any, cancelbtn: any) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
    ...modalProps || {},
  });
};

export default Index;

export {
  handleBuildModal,
};
