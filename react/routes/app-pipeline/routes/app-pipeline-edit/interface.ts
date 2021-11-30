/* eslint-disable max-len */
import { useFormatMessageRetrunTypes } from '@choerodon/master';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from './stores/CONSTANTS';
import { StoreProps } from './stores/useStore';

export type AppPipelineEditIndexProps = {
};

export type AppPipelineEditStoreContext = {
  prefixCls: 'c7ncd-app-pipeline-edit'
  intlPrefix: 'c7ncd.app.pipeline.edit'
  mainStore: StoreProps
  // @ts-expect-error
  formatAppPipelineEdit: useFormatMessageRetrunTypes,
    // @ts-expect-error
  formatCommon:useFormatMessageRetrunTypes,
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & AppPipelineEditIndexProps;

export type TabkeyTypes = typeof TAB_BASIC | typeof TAB_ADVANCE_SETTINGS | typeof TAB_CI_CONFIG | typeof TAB_FLOW_CONFIG
