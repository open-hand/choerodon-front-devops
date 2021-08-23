import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import { CONSTANTS } from '@choerodon/master';
import { Modal, Button } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import AppInfo from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info';
import AppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config';
import ResourceConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config';
import { mapping } from './components/app-config/stores/appConfigDataSet';

const appCreateModalKey = Modal.key();

const { Step } = Steps;

const {
  MODAL_WIDTH: {
    MAX,
  },
} = CONSTANTS;

const AppCreateForm = (props: any) => {
  const {
    modal,
  } = props;

  const appInfoRef = useRef();
  const appConfigRef = useRef();
  const resourceConfigRef = useRef();

  const stepData = useRef([{
    title: '应用信息',
    ref: appInfoRef,
    children: () => <AppInfo cRef={appInfoRef} />,
    data: null,
  }, {
    title: '应用配置',
    ref: appConfigRef,
    children: () => <AppConfig cRef={appConfigRef} />,
    data: null,
  }, {
    title: '资源配置',
    ref: resourceConfigRef,
    children: ({ envId }: any) => (
      <ResourceConfig
        cRef={resourceConfigRef}
        envId={envId}
      />
    ),
    data: null,
  }]);

  const [current, setCurrent] = useState(0);

  const handleRenderStep = () => stepData.current.map((item) => (
    <Step title={item.title} />
  ));

  const handleNext = async () => {
    const res = await (stepData.current?.[current]?.ref?.current as any)?.handleOk();
    if (res) {
      stepData.current[current].data = res;
      setCurrent(current + 1);
    }
    return false;
  };

  modal.handleOk(handleNext);

  const handlePre = () => {
    const newCurrent = current - 1;
    setCurrent(newCurrent);
    setTimeout(() => {
      const data = stepData.current?.[newCurrent].data;
      (stepData.current?.[newCurrent]?.ref?.current as any)?.handleInit(data);
    }, 500);
  };

  useEffect(() => {
    modal.update({
      footer: ((okBtn: React.ReactNode, cancelBtn: React.ReactNode) => (
        <>
          {cancelBtn}
          {
            current > 0 && (
              <Button
                onClick={handlePre}
              >
                上一步
              </Button>
            )
          }
          {okBtn}
        </>
      )),
    });
  }, [current]);

  return (
    <div>
      <Steps current={current}>
        {handleRenderStep()}
      </Steps>
      {
        stepData.current[current].children(current === 2 ? ({
          envId: stepData?.current?.[1]?.data?.[mapping.env.name as string],
        }) : {})
      }
    </div>
  );
};

export function openAppCreateModal() {
  Modal.open({
    key: appCreateModalKey,
    title: '创建应用',
    children: <AppCreateForm />,
    okText: '下一步',
    drawer: true,
    style: {
      width: MAX,
    },
    // onCancel: handleOk,
  });
}
