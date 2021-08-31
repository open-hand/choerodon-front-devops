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
import HostAppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config';
import { mapping, chartSourceData } from './components/app-config/stores/appConfigDataSet';
import { mapping as infoMapping, deployProductOptionsData, deployModeOptionsData } from './components/app-info/stores/appInfoDataSet';
import { appServiceInstanceApi, deployApi } from '@/api';
import { mapping as deployGroupConfigMapping } from './components/deploy-group-config/stores/deployGroupConfigDataSet';
import { devopsDeployGroupApi } from '@/api/DevopsDeployGroup';

import './index.less';

const appCreateModalKey = Modal.key();

const { Step } = Steps;

const {
  MODAL_WIDTH: {
    MAX,
  },
} = CONSTANTS;

const setKeyValue = (obj: { [key: string]: any }, key: string, value: any) => {
  // eslint-disable-next-line no-param-reassign
  obj[key] = value;
};

const getAppConfigData = ({
  options,
  appConfig,
  annotations,
  labels,
  nodeLabels,
  hostAliases,
}: any) => {
  function setData(data: any): object {
    const result: {
      [key: string]: any
    } = {};
    data.forEach((i: any) => {
      if (i?.key && i?.value) {
        result[i.key as string] = i.value;
      }
    });
    return result;
  }
  const res = {};
  setKeyValue(
    res,
    'options',
    setData(options),
  );
  setKeyValue(
    res,
    deployGroupConfigMapping.podNum.name as string,
    appConfig[deployGroupConfigMapping.podNum.name as string],
  );
  setKeyValue(
    res,
    deployGroupConfigMapping.MaxSurge.name as string,
    appConfig[deployGroupConfigMapping.MaxSurge.name as string],
  );
  setKeyValue(
    res,
    deployGroupConfigMapping.MaxUnavailable.name as string,
    appConfig[deployGroupConfigMapping.MaxUnavailable.name as string],
  );
  setKeyValue(
    res,
    deployGroupConfigMapping.DNSPolicy.name as string,
    appConfig[deployGroupConfigMapping.DNSPolicy.name as string],
  );
  setKeyValue(
    res,
    deployGroupConfigMapping.Nameservers.name as string,
    appConfig[deployGroupConfigMapping.Nameservers.name as string],
  );
  setKeyValue(
    res,
    deployGroupConfigMapping.Searches.name as string,
    appConfig[deployGroupConfigMapping.Searches.name as string],
  );
  setKeyValue(
    res,
    'annotations',
    setData(annotations),
  );
  setKeyValue(
    res,
    'labels',
    setData(labels),
  );
  setKeyValue(
    res,
    'nodeSelector',
    setData(nodeLabels),
  );
  setKeyValue(
    res,
    'hostAlias',
    setData(hostAliases),
  );
  return res;
};

const AppCreateForm = (props: any) => {
  const {
    modal,
    refresh,
  } = props;

  const appInfoRef = useRef();
  const appConfigRef = useRef();
  const resourceConfigRef = useRef();

  const [current, setCurrent] = useState(0);

  const stepData = useRef([{
    title: '应用信息',
    display: true,
    ref: appInfoRef,
    children: () => <AppInfo cRef={appInfoRef} />,
    data: null,
  }, {
    title: '应用配置',
    ref: appConfigRef,
    display: true,
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
        case deployModeOptionsData[1].value: {
          return (
            <HostAppConfig
              cRef={appConfigRef}
            />
          );
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
    display: true,
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
              return (
                <ContainerConfig
                  cRef={resourceConfigRef}
                />
              );
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

  const handleRenderStep = () => stepData.current.filter((item) => item.display).map((item) => (
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

  const changeStepDisplay = (data: any) => {
    if (data[(infoMapping.deployMode.name) as string] === deployModeOptionsData[0].value) {
      stepData.current[2].display = true;
    } else {
      stepData.current[2].display = false;
    }
  };

  const handleSetSubmitDataByAppConfig = ({
    appConfigData,
    submitData,
  }: any) => {
    const res = submitData;
    let request;
    switch (appConfigData[mapping.chartSource.name as string]) {
      case chartSourceData[0].value: case chartSourceData[1].value: {
        request = 'chart_normal';
        setKeyValue(
          res,
          mapping.hzeroVersion.name as string,
          appConfigData[mapping.hzeroVersion.name as string],
        );
        setKeyValue(
          res,
          mapping.serviceVersion.name as string,
          appConfigData[mapping.serviceVersion.name as string],
        );
        setKeyValue(
          res,
          mapping.env.name as string,
          appConfigData[mapping.env.name as string],
        );
        setKeyValue(
          res,
          mapping.value.name as string,
          appConfigData[mapping.value.name as string],
        );
        break;
      }
      case chartSourceData[2].value: case chartSourceData[3].value: {
        request = 'chart_market';
        setKeyValue(
          res,
          mapping.marketVersion.name as string,
          appConfigData[mapping.marketServiceVersion.name as string]
            .marketServiceDeployObjectVO.marketServiceId,
        );
        setKeyValue(
          res,
          mapping.marketServiceVersion.name as string,
          appConfigData[mapping.marketServiceVersion.name as string].id,
        );
        setKeyValue(
          res,
          mapping.env.name as string,
          appConfigData[mapping.env.name as string],
        );
        setKeyValue(
          res,
          mapping.value.name as string,
          appConfigData[mapping.value.name as string],
        );
        setKeyValue(
          res,
          'applicationType' as string,
          'market',
        );
      }
      default: {
        break;
      }
    }
    return ({
      res,
      request,
    });
  };

  const handleSetSubmitDataByResourceSetting = ({
    resourceConfigData,
    submitData,
  }: any) => ({
    ...submitData,
    ...resourceConfigData,
  });

  const handleSetSubmitDataByDeployGroupConfig = ({
    appConfigData,
    submitData,
  }: any) => {
    const {
      annotations,
      appConfig,
      hostAliases,
      labels,
      nodeLabels,
      options,
    } = appConfigData;
    const data = submitData;
    setKeyValue(
      data,
      deployGroupConfigMapping.env.name as string,
      appConfig[deployGroupConfigMapping.env.name as string],
    );
    setKeyValue(
      data,
      'appConfig',
      getAppConfigData({
        options,
        appConfig,
        annotations,
        labels,
        nodeLabels,
        hostAliases,
      }),
    );
    return data;
  };

  const handleSetSubmitDataByContainerConfig = ({
    resourceConfigData,
    submitData,
  }: any) => {
    const newData = submitData;
    setKeyValue(
      newData,
      'containerConfig',
      resourceConfigData,
    );
    return newData;
  };

  const handleSubmit = async () => {
    let submitData = {};
    const appInfoData = stepData.current[0].data;
    const appConfigData = stepData.current[1].data;
    const resourceConfigData = stepData.current[2].data;
    let request;
    if (appInfoData) {
      setKeyValue(
        submitData,
        infoMapping.appName.name as string,
        appInfoData[infoMapping.appName.name as string],
      );
      setKeyValue(
        submitData,
        infoMapping.appCode.name as string,
        appInfoData[infoMapping.appCode.name as string],
      );
      setKeyValue(
        submitData,
        'instanceName' as string,
        appInfoData[infoMapping.appCode.name as string],
      );
      switch (appInfoData[infoMapping.deployMode.name as string]) {
        case deployModeOptionsData[0].value: {
          switch (appInfoData[infoMapping.deployProductType.name as string]) {
            case deployProductOptionsData[0].value: {
              const { res, request: newRequest } = handleSetSubmitDataByAppConfig({
                appConfigData,
                submitData,
              });
              submitData = res;
              request = newRequest;
              submitData = handleSetSubmitDataByResourceSetting({
                resourceConfigData,
                submitData,
              });
              break;
            }
            case deployProductOptionsData[1].value: {
              submitData = handleSetSubmitDataByDeployGroupConfig({
                appConfigData,
                submitData,
              });
              submitData = handleSetSubmitDataByContainerConfig({
                resourceConfigData,
                submitData,
              });
              request = 'deploy_group';
              break;
            }
            default: {
              break;
            }
          }
          break;
        }
        case deployModeOptionsData[1].value: {
          submitData = {
            ...submitData,
            // @ts-ignore
            ...appConfigData,
          };
          request = 'deploy_host';
          break;
        }
        default: {
          break;
        }
      }
    }
    console.log(submitData);
    let result;
    // @ts-ignore
    switch (request) {
      case 'chart_normal': {
        result = await appServiceInstanceApi?.createAppServiceInstance(submitData);
        break;
      }
      case 'chart_market': {
        result = await appServiceInstanceApi?.createMarketAppService(submitData);
        break;
      }
      case 'deploy_group': {
        result = await devopsDeployGroupApi?.createDeployGroup('create', submitData);
        break;
      }
      case 'deploy_host': {
        result = await deployApi.deployJava(submitData);
        break;
      }
      default: {
        result = '';
        break;
      }
    }
    return result;
  };

  const handleNext = async () => {
    const res = await (stepData.current?.[current]?.ref?.current as any)?.handleOk();
    if (res) {
      stepData.current[current].data = res;
      if (current === 0) {
        changeStepDataTitle(res);
        changeStepDisplay(res);
      }
      if (current < stepData.current.filter((i) => i.display).length - 1) {
        setCurrent(current + 1);
      } else {
        try {
          await handleSubmit();
          refresh();
          return true;
        } catch (e) {
          return false;
        }
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

export function openAppCreateModal(refresh: Function) {
  Modal.open({
    key: appCreateModalKey,
    title: '创建应用',
    children: <AppCreateForm refresh={refresh} />,
    okText: '下一步',
    drawer: true,
    style: {
      width: MAX,
    },
    // onCancel: handleOk,
  });
}

export { setKeyValue, getAppConfigData };