/* eslint-disable max-len */
import { TabkeyTypes } from '../../interface';
import {
  STAGE_CD,
  STAGE_CI,
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
  type?:'create' | 'edit'
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & AppPipelineEditIndexProps;

export type STAGE_TYPES = typeof STAGE_CI | typeof STAGE_CD;
