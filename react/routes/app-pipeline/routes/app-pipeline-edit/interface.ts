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
  formatAppPipelineEdit: any,
  formatCommon:any,
  currentKey:TabkeyTypes,
  type?:'create' | 'edit' | 'copy'
  level?:'organization' | 'site' | 'project'
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & AppPipelineEditIndexProps;

export type STAGE_TYPES = typeof STAGE_CI | typeof STAGE_CD;
