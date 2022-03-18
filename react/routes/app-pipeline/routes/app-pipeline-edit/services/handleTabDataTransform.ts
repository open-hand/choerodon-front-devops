/* eslint-disable max-len */
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import { TabkeyTypes } from '@/routes/app-pipeline/interface';
import { STAGE_CD, STAGE_CI } from '../stores/CONSTANTS';

function transformAdvancedSetting(data: any) {
  const result = {
    ...data,
    devopsCiPipelineFunctionDTOList: data?.devopsCiPipelineFunctionDTOList.filter((i: any) => i?.devopsPipelineId !== 0),
  };
  if (!result?.versionStrategy) {
    delete result.versionName;
  }
  return result;
}

export function handleTabDataTransform(tabsData:Record<TabkeyTypes, any>) {
  const {
    basicInfo = {},
    flowConfiguration = [],
    ciConfigs = [],
    advancedSettings = {},
  } = tabsData;

  const {
    appService = {}, branch = [], pipelineName: name, objectVersionNumber,
  } = basicInfo;

  const finalData = {
    ...appService,
    ...transformAdvancedSetting(advancedSettings),
    name,
  };

  if (objectVersionNumber) {
    finalData.objectVersionNumber = objectVersionNumber;
  }

  if (branch && branch.length) {
    finalData.relatedBranches = map(branch, (item) => item?.branchName);
  }

  if (ciConfigs && ciConfigs.length) {
    finalData.devopsCiPipelineVariableDTOList = ciConfigs.filter((obj:any) => obj?.variableKey && obj?.variableValue && !isEmpty(obj));
  }

  if (flowConfiguration && flowConfiguration.length) {
    const devopsCiStageVOS: { type: string; }[] = [];
    const devopsCdStageVOS: { type: string; }[] = [];
    flowConfiguration.forEach((item: { type: string; }) => {
      if (item.type === STAGE_CI) devopsCiStageVOS.push(item);
      if (item.type === STAGE_CD) devopsCdStageVOS.push(item);
    });
    finalData.devopsCiStageVOS = devopsCiStageVOS;
    finalData.devopsCdStageVOS = devopsCdStageVOS;
  }

  return finalData;
}
