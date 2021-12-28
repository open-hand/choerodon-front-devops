/* eslint-disable max-len */
import map from 'lodash/map';
import { TabkeyTypes } from '@/routes/app-pipeline/interface';
import { STAGE_CD, STAGE_CI } from '../stores/CONSTANTS';

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
    ...advancedSettings,
    name,
  };

  if (objectVersionNumber) {
    finalData.objectVersionNumber = objectVersionNumber;
  }

  if (branch && branch.length) {
    finalData.relatedBranches = map(branch, (item) => item?.branchName);
  }

  if (ciConfigs && ciConfigs.length) {
    finalData.devopsCiPipelineVariableDTOList = ciConfigs;
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