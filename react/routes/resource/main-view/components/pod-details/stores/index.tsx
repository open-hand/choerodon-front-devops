/* eslint-disable max-len */
import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet as DataSetProps, DataSetSelection } from '@/interface';
import useStore, { StoreProps } from './useStore';
import PodDetailsDataset from './PodDetailsDataset';

interface ContentProps {
  podDetailStore: StoreProps;
  prefixCls: string;
  intlPrefix: string;
  projectId: string;
  formatMessage(arg0: object, arg1?: object): string;
  podsDs: DataSetProps;
}

const Store = createContext({} as ContentProps);

export function usePodDetailstore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')(
    observer((props: any) => {
      const {
        children,
        intl: { formatMessage },
        AppState: {
          currentMenuType: { id: projectId },
        },
      } = props;

      const intlPrefix = 'c7ncd.deployment';

      const podDetailStore = useStore();

      const podsDs = useMemo(() => new DataSet(PodDetailsDataset({ formatMessage, intlPrefix })), []);

      const value = {
        ...props,
        podDetailStore,
        formatMessage,
        projectId,
        podsDs,
        prefixCls: 'c7ncd-deployment',
      };
      return <Store.Provider value={value}>{children}</Store.Provider>;
    }),
  ),
);
