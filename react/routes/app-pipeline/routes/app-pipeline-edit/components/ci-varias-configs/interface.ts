import { DataSet } from '@/interface';
import { StoreProps } from './stores/useStore';

export type CiVariasConfigsIndexProps = {
};

export type CiVariasConfigsStoreContext = {
  prefixCls: 'c7ncd-ci-varias-configs'
  intlPrefix: 'c7ncd.app.pipeline'
  mainStore: StoreProps
  formDs: DataSet,
  // @ts-expect-error
  formatAppPipeline: IntlFormatters['formatMessage'],
  // @ts-expect-error
  formatCommon: IntlFormatters['formatMessage'],
} & ProviderProps;

export type ProviderProps = {
  [fields:string]:any
} & CiVariasConfigsIndexProps;