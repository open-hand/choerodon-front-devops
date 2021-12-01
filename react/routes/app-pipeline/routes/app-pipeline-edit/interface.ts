/* eslint-disable max-len */
import { useFormatMessageRetrunTypes } from '@choerodon/master';
import {
  STAGE_CD,
  STAGE_CI,
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from './stores/CONSTANTS';

export type AppPipelineEditIndexProps = {
};

export type AppPipelineEditStoreContext = {
  prefixCls: 'c7ncd-app-pipeline-edit'
  intlPrefix: 'c7ncd.app.pipeline.edit'
  // @ts-expect-error
  formatAppPipelineEdit: useFormatMessageRetrunTypes,
    // @ts-expect-error
  formatCommon:useFormatMessageRetrunTypes,
  currentKey:TabkeyTypes,
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & AppPipelineEditIndexProps;

export type TabkeyTypes = typeof TAB_BASIC | typeof TAB_ADVANCE_SETTINGS | typeof TAB_CI_CONFIG | typeof TAB_FLOW_CONFIG

export type STAGE_TYPES = typeof STAGE_CI | typeof STAGE_CD;
