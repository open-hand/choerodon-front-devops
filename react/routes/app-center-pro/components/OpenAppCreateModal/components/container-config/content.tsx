import React, { useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { Record } from '@/interface';
import ContainerGroup from './components/container-group';
import ContainerDetail from './components/container-detail';
import { useContainerConfig } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores';
import { mapping } from './stores/conGroupDataSet';
import { mapping as portMapping } from './stores/portConfigDataSet';

import './index.less';

const Index = observer(() => {
  const {
    ConGroupDataSet,
    cRef,
  } = useContainerConfig();

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
      deployObjectId: newD[mapping.marketServiceVersion.name as string]
        ?.marketServiceDeployObjectVO?.id,
      [mapping.shareAppService.name as string]: newD[mapping.shareAppService.name as string],
      [mapping.shareServiceVersion.name as string]: newD[
        mapping.shareServiceVersion.name as string],
      imageInfo: {
        repoType: newD[mapping.projectImageRepo.name as string]?.repoType,
        repoId: newD[mapping.projectImageRepo.name as string]?.repoId,
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
      deployObjectId: newD[mapping.marketServiceVersion.name as string]
        ?.marketServiceDeployObjectVO?.id,
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
