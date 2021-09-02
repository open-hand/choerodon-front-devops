/* eslint-disable max-len */
import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import NonePermissionDataSet from './NonePermissionDataSet';

type ContextProps = {
  [fields:string]:any
}

const Store = createContext({} as ContextProps);

export function usePermissionModalStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const {
      AppState: { currentMenuType: { id: projectId } },
      intl: { formatMessage },
      children,
      envId,
    } = props;

    const nonePermissionDs = useMemo(() => new DataSet(NonePermissionDataSet(envId)), [envId]);

    const value = {
      ...props,
      nonePermissionDs,
      formatMessage,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
