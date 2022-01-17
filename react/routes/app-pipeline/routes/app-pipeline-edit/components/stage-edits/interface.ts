/* eslint-disable max-len */
import { StoreProps } from './stores/useStore';

export type StageEditsDataTypes = {
  devopsCdStageVOS:any[]
  devopsCiStageVOS:any[]
}

export type StageEditsIndexProps = {
};

export type StageEditsStoreContext = {
  prefixCls: 'c7ncd-stage-edits'
  intlPrefix: 'c7ncd.app.pipeline.edit'
  mainStore: StoreProps
  formatPipelinEdit: any,
  formatCommon: any,
  setOpenPanelIdentity:Function,
  currentOpenPanelIdentity:any
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & StageEditsIndexProps;
