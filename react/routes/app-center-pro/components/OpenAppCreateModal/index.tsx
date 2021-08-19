import React, { useEffect, useRef, useState } from 'react';
import { CONSTANTS } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import AppInfo from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info';

const appCreateModalKey = Modal.key();

const { Step } = Steps;

const {
  MODAL_WIDTH: {
    MAX,
  },
} = CONSTANTS;

const AppCreateForm = () => {
  const stepData = useRef([{
    title: '应用信息',
    children: <AppInfo />,
  }, {
    title: '应用配置',
  }, {
    title: '资源配置',
  }]);

  const [current, setCurrent] = useState(0);

  const handleRenderStep = () => stepData.current.map((item) => (
    <Step title={item.title} />
  ));

  return (
    <div>
      <Steps current={current}>
        {handleRenderStep()}
      </Steps>
      {
        stepData.current[current].children
      }
    </div>
  );
};

export function openAppCreateModal() {
  Modal.open({
    key: appCreateModalKey,
    title: '创建应用',
    children: <AppCreateForm />,
    okText: '确定',
    drawer: true,
    style: {
      width: MAX,
    },
    // onOk: handleOk,
    // onCancel: handleOk,
  });
}
