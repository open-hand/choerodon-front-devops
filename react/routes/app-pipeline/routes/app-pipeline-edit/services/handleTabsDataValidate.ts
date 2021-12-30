/* eslint-disable max-len */
import every from 'lodash/every';
import { isEmpty } from 'lodash';
import { TabkeyTypes } from '@/routes/app-pipeline/interface';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from '../stores/CONSTANTS';

const validateMap:Partial<Record<TabkeyTypes, (data:any, type:'create'|'edit'|'copy')=>{ reason:string |'', isValidated:boolean }>> = {
  [TAB_BASIC]: handleValidBasicInfo,
  [TAB_FLOW_CONFIG]: handleValideStage,
  [TAB_CI_CONFIG]: () => ({ isValidated: true, reason: '' }),
  [TAB_ADVANCE_SETTINGS]: handleValidAdvanced,
};

function handleValidAdvanced(data: any) {
  const flag = data?.devopsCiPipelineFunctionDTOList?.some((i: any) => i.edit);
  return {
    isValidated: !flag,
    reason: flag ? '自定义函数存在校验失败' : '',
  };
}

function handleValidBasicInfo(data:any, type:'create'|'edit'|'copy') {
  const { pipelineName, appService, branch } = data;
  if (!pipelineName) {
    return {
      isValidated: false,
      reason: '请输入流水线名称',
    };
  }
  if (!appService) {
    return {
      isValidated: false,
      reason: '请输入流水线名称',
    };
  }
  if (['create', 'copy'].includes(type) && (!branch || isEmpty(branch))) {
    return {
      isValidated: false,
      reason: '请选择一个分支',
    };
  }
  return {
    isValidated: true,
    reason: '',
  };
}

function handleValideStage(stagesData:Array<{jobList:{completed:boolean}[]} & Record<string, any>>, type:'create'|'edit'|'copy'):{ reason:string |'', isValidated:boolean } {
  if (!stagesData.length) {
    return { isValidated: false, reason: '流水线的阶段不能为空' };
  }
  const isCompleted = stagesData.every(({ jobList }) => {
    if (!jobList?.length) return false;
    return jobList.every(({ completed }) => completed);
  });
  if (!isCompleted) {
    return { isValidated: false, reason: '存在空阶段或是未填写必填项的任务' };
  }
  return { isValidated: true, reason: '' };
}

export function handleTabDataValidate(tabsData:Partial<Record<TabkeyTypes, unknown>>, type:'create'|'edit'|'copy') {
  let validatedObj:{key?:TabkeyTypes, reason?:string, isValidated:boolean } = {
    isValidated: true,
  };
  const isValidatedAll = every(tabsData, (data, key:TabkeyTypes) => {
    if (!(key in validateMap)) {
      validatedObj = { key, reason: `Tab which key is ${key} has no data`, isValidated: false };
      return false;
    }
    const { reason, isValidated } = validateMap[key]?.(data, type) || { reason: '' };
    if (!isValidated) {
      validatedObj = { key, reason, isValidated: false };
      return false;
    }
    return true;
  });
  return validatedObj;
}
