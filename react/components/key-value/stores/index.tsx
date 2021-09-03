import React, { createContext, useContext, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import formDataSet from './formDataSet';
import keyValueDataSet from './keyValueDataSet';
import useSelectStore from './useSecretStore';

const Store = createContext({} as any);

export function useKeyValueStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props:any) => {
  const {
    id,
    intl: { formatMessage },
    AppState: {
      currentMenuType: {
        projectId,
      },
    },
    envId,
    children,
    title,
    type,
  } = props;

  const store = useSelectStore(title);

  const KeyValueDataSet = useMemo(() => new DataSet(keyValueDataSet()), []);
  const FormDataSet = useMemo(() => new DataSet(formDataSet({
    title, id, formatMessage, projectId, envId, store,
  })), [envId, id, projectId, store, title]);

  const value = {
    ...props,
    FormDataSet,
    KeyValueDataSet,
    store,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
