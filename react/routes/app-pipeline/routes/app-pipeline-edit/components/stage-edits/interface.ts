/* eslint-disable max-len */
import { TabkeyTypes } from '../../interface';
import { StoreProps } from './stores/useStore';

export type StageEditsDataTypes = {
  devopsCdStageVOS:any[]
  devopsCiStageVOS:any[]
}

export type StageEditsIndexProps = {
  savedHandler: readonly [StageEditsDataTypes, (data:StageEditsDataTypes)=>any, (tabKey:TabkeyTypes)=>unknown]
};

export type StageEditsStoreContext = {
  prefixCls: 'c7ncd-stage-edits'
  intlPrefix: 'c7ncd.app.pipeline.edit'
  mainStore: StoreProps
  // @ts-expect-error
  formatPipelinEdit: IntlFormatters['formatMessage'],
  // @ts-expect-error
  formatCommon: IntlFormatters['formatMessage'],
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & StageEditsIndexProps;
