import { DataSet } from '@/interface';

export type CiVariasConfigsIndexProps = {
};

export type CiVariasConfigsStoreContext = {
  prefixCls: 'c7ncd-ci-varias-configs'
  intlPrefix: 'c7ncd.app.pipeline'
  formDs: DataSet,
  formatAppPipeline: any,
  formatCommon: any,
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & CiVariasConfigsIndexProps;
