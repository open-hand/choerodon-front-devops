import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import { CONSTANTS } from '@choerodon/master';
import { Modal, Button } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import AppInfo from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info';
import AppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config';
import ResourceConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config';
import DeployGroupConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config';
import ContainerConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config';
import { mapping } from './components/app-config/stores/appConfigDataSet';
import { mapping as infoMapping, deployProductOptionsData, deployModeOptionsData } from './components/app-info/stores/appInfoDataSet';

import './index.less';

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

  const [current, setCurrent] = useState(0);

  const stepData = useRef([{
    title: '应用信息',
    ref: appInfoRef,
    children: () => <AppInfo cRef={appInfoRef} />,
    data: null,
  }, {
    title: '应用配置',
    ref: appConfigRef,
    children: ({ deployMode, deployType }: any) => {
      switch (deployMode) {
        case deployModeOptionsData[0].value: {
          switch (deployType) {
            case deployProductOptionsData[0].value: {
              return <AppConfig cRef={appConfigRef} />;
              break;
            }
            case deployProductOptionsData[1].value: {
              return <DeployGroupConfig cRef={appConfigRef} />;
            }
            default: {
              return '';
              break;
            }
          }
          break;
        }
        default: {
          return '';
          break;
        }
      }
    },
    data: null,
  }, {
    title: '资源配置',
    ref: resourceConfigRef,
    children: ({ envId, deployMode, deployType }: any) => {
      switch (deployMode) {
        case deployModeOptionsData[0].value: {
          switch (deployType) {
            case deployProductOptionsData[0].value: {
              return (
                <ResourceConfig
                  cRef={resourceConfigRef}
                  envId={envId}
                />
              );
              break;
            }
            case deployProductOptionsData[1].value: {
              return <ContainerConfig />;
              break;
            }
            default: {
              return '';
              break;
            }
          }
        }
        default: {
          return '';
          break;
        }
      }
    },
    data: null,
  }]);

  const handleRenderStep = () => stepData.current.map((item) => (
    <Step title={item.title} />
  ));

  const changeStepDataTitle = (data: any) => {
    if (data[(infoMapping?.deployProductType?.name) as string]
      === deployProductOptionsData[0].value) {
      stepData.current[2].title = '资源配置';
    } else if (data[(infoMapping?.deployProductType?.name) as string]
      === deployProductOptionsData[1].value) {
      stepData.current[2].title = '容器配置';
    }
  };

  const handleNext = async () => {
    const res = await (stepData.current?.[current]?.ref?.current as any)?.handleOk();
    if (res) {
      stepData.current[current].data = res;
      if (current === 0) {
        changeStepDataTitle(res);
      }
      if (current < stepData.current.length - 1) {
        setCurrent(current + 1);
      } else {
        console.log('提交');
      }
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

  const getChildrenParams = () => {
    switch (current) {
      case 1: {
        return ({
          deployMode: stepData?.current?.[0]?.data?.[infoMapping.deployMode.name as string],
          deployType: stepData?.current?.[0]?.data?.[infoMapping.deployProductType.name as string],
        });
      }
      case 2: {
        return ({
          deployMode: stepData?.current?.[0]?.data?.[infoMapping.deployMode.name as string],
          deployType: stepData?.current?.[0]?.data?.[infoMapping.deployProductType.name as string],
          envId: stepData?.current?.[1]?.data?.[mapping.env.name as string],
        });
      }
      default: {
        return ({});
      }
    }
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
    <div className="c7ncd-appCenterPro-appCreateModal">
      <Steps current={current}>
        {handleRenderStep()}
      </Steps>
      {
        stepData.current[current].children(getChildrenParams())
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
