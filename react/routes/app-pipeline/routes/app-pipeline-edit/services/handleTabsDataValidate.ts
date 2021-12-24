/* eslint-disable max-len */
import every from 'lodash/every';
import { TabkeyTypes } from '@/routes/app-pipeline/interface';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from '../stores/CONSTANTS';

const validateMap:Partial<Record<TabkeyTypes, (data:any)=>{ reason:string |'', isValidated:boolean }>> = {
  [TAB_BASIC]: () => ({ isValidated: true, reason: '' }),
  [TAB_FLOW_CONFIG]: handleValideStage,
  [TAB_CI_CONFIG]: () => ({ isValidated: true, reason: '' }),
  [TAB_ADVANCE_SETTINGS]: () => ({ isValidated: true, reason: '' }),
};

function handleValideStage(stagesData:Array<{jobList:{completed:boolean}[]} & Record<string, any>>):{ reason:string |'', isValidated:boolean } {
  const isCompleted = stagesData.every(({ jobList }) => {
    if (!jobList?.length) return false;
    return jobList.every(({ completed }) => completed);
  });
  if (!isCompleted) {
    return { isValidated: false, reason: '存在空阶段或是未填写必填项的job' };
  }
  return { isValidated: true, reason: '' };
}

export function handleTabDataValidate(tabsData:Partial<Record<TabkeyTypes, unknown>>) {
  let validatedObj:{key?:TabkeyTypes, reason?:string, isValidated:boolean } = {
    isValidated: true,
  };
  const isValidatedAll = every(tabsData, (data, key:TabkeyTypes) => {
    if (!(key in validateMap)) {
      validatedObj = { key, reason: `Tab which key is ${key} has no data`, isValidated: false };
      return false;
    }
    const { reason, isValidated } = validateMap[key]?.(data) || { reason: '' };
    if (!isValidated) {
      validatedObj = { key, reason, isValidated: false };
      return false;
    }
    return true;
  });
  return validatedObj;
}
