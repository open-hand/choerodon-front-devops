/* eslint-disable max-len */
import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import TableDataset from './TableDataset';

const Store = createContext({} as any);

export function useMirrorScanStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
  } = props;

  const detailDs = useMemo(() => new DataSet(TableDataset()), []);

  const value = {
    ...props,
    projectId,
    prefixCls: 'c7ncd-mirrorScanning',
    detailDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
