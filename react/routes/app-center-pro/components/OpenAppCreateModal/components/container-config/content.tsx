import React, { useEffect, useImperativeHandle, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Record } from '@/interface';
import ContainerGroup from './components/container-group';
import ContainerDetail from './components/container-detail';
import { useContainerConfig } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores';
import { mapping } from './stores/conGroupDataSet';
import { mapping as portMapping } from './stores/portConfigDataSet';
import { setOptionsDs } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config/content';

import './index.less';

const setReturnData = (data: any) => data.records.map((d: any) => {
  function setData(data2: any): object {
    const result: {
      [key: string]: any
    } = {};
    data2.forEach((i: any) => {
      if (i?.key && i?.value) {
        result[i.key as string] = i.value;
      }
    });
    return result;
  }
  const newD = d.toData();
  const envData = d.getField(mapping.enVariable.name).options.toData();
  let portData = null;
  if (d.getField(mapping.portConfig.name).options.records[0].get(portMapping.agreement.name)) {
    portData = d.getField(mapping.portConfig.name).options.toData();
  }
  newD.dockerDeployVO = {
    sourceType: newD[mapping.productSource.name as string],
    deployObjectId: newD[mapping.marketServiceVersion.name as string].id
      || newD[mapping.marketServiceVersion.name as string],
    mktAppVersionId: newD[mapping.marketAppVersion.name as string],
    [mapping.shareAppService.name as string]: newD[mapping.shareAppService.name as string],
    [mapping.shareServiceVersion.name as string]: newD[
      mapping.shareServiceVersion.name as string],
    imageInfo: {
      repoType: newD[mapping.projectImageRepo.name as string]?.repoType,
      repoId: newD[mapping.projectImageRepo.name as string]?.repoId,
      repoName: newD[mapping.projectImageRepo.name as string]?.repoName,
      imageName: newD[mapping.image.name as string]?.imageName,
      [mapping.imageVersion.name as string]: newD[mapping.imageVersion.name as string],
      [mapping.repoAddress.name as string]: newD[mapping.repoAddress.name as string],
      [mapping.repoType.name as string]: newD[mapping.repoType.name as string],
      [mapping.password.name as string]: newD[mapping.password.name as string],
      [mapping.username.name as string]: newD[mapping.username.name as string],
    },
  };
  newD.jarDeployVO = {
    sourceType: newD[mapping.productSource.name as string],
    deployObjectId: newD[mapping.marketServiceVersion.name as string].id
      || newD[mapping.marketServiceVersion.name as string],
    mktAppVersionId: newD[mapping.marketAppVersion.name as string],
    [mapping.jarFileDownloadUrl.name as string]:
      newD[mapping.jarFileDownloadUrl.name as string],
    prodJarInfoVO: {
      [mapping.nexus.name as string]: newD[mapping.nexus.name as string],
      [mapping.projectProductRepo.name as string]: newD[
        mapping.projectProductRepo.name as string]?.repositoryId,
      [mapping.groupId.name as string]: newD[mapping.groupId.name as string],
      [mapping.artifactId.name as string]: newD[mapping.artifactId.name as string],
      [mapping.jarVersion.name as string]: newD[mapping.jarVersion.name as string],
    },
  };
  newD.envs = setData(envData);
  newD.ports = portData;
  return newD;
});

const Index = observer(() => {
  const {
    ConGroupDataSet,
    cRef,
    detail,
    modal,
    refresh,
  } = useContainerConfig();

  const [extraData, setExtraData] = useState({});

  useEffect(() => {
    if (typeof (detail) === 'object') {
      setExtraData({
        instanceId: detail.instanceId,
        envId: detail.environmentId,
      });
      ConGroupDataSet.loadData(detail.containerConfig.map((item: any, index: number) => ({
        ...item,
        ...item.dockerDeployVO,
        ...item.dockerDeployVO.imageInfo,
        ...item.jarDeployVO,
        ...item.jarDeployVO.prodJarInfoVO,
        [mapping.projectImageRepo.name as string]: {
          repoId: item.dockerDeployVO.imageInfo.repoId,
          repoName: item.dockerDeployVO.imageInfo.repoName,
          repoType: item.dockerDeployVO.imageInfo.repoType,
        },
        [mapping.marketAppVersion.name as string]: item.dockerDeployVO.mktAppVersionId,
        [mapping.marketServiceVersion.name as string]: item.dockerDeployVO.deployObjectId,
        [mapping.image.name as string]: {
          imageName: item.dockerDeployVO.imageInfo.imageName,
        },
        edit: false,
        focus: index === 0,
        name: item.name,
      })));
      setTimeout(() => {
        ConGroupDataSet.records.forEach((record: any) => {
          record.getField(mapping.portConfig.name).options.loadData(record.get('ports'));
          setOptionsDs(record.getField(mapping.enVariable.name).options, record.get('envs'));
        });
      }, 1000);
    }
  }, []);

  const handleOk = async () => {
    const result = setReturnData(ConGroupDataSet);
    ConGroupDataSet.setQueryParameter('data', {
      ...extraData,
      containerConfig: result,
    });
    const res = await ConGroupDataSet.submit();
    if (res !== false) {
      if (refresh) {
        refresh();
      }
      return true;
    }
    return false;
  };

  if (modal) {
    modal.handleOk(handleOk);
  }

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const flag = await ConGroupDataSet.validate();
      const flag2 = await ConGroupDataSet
        .current.getField(mapping.portConfig.name).options.validate();
      const flag3 = await ConGroupDataSet
        .current.getField(mapping.enVariable.name).options.validate();
      if (flag && flag2 && flag3) {
        return setReturnData(
          ConGroupDataSet,
        );
      }
      return false;
    },
  }));

  return (
    <div className="c7ncd-appCenterPro-conConfig">
      <ContainerGroup
        className="c7ncd-appCenterPro-conConfig__conGroup"
        dataSource={ConGroupDataSet}
      />
      <ContainerDetail
        className="c7ncd-appCenterPro-conConfig__conDetail"
        dataSource={ConGroupDataSet
          .records.find((record: Record) => record.get(mapping.focus.name))}
      />
    </div>
  );
});

export default Index;

export { setReturnData };