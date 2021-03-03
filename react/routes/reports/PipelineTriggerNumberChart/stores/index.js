import React, { createContext, useContext } from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';

const Store = createContext();

export function usePipelineTriggerNumberStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props) => {
  const {
    intl: { formatMessage },
    children,
  } = props;

  const prefixCls = 'c7ncd-pipelineTriggerNumber';

  const value = {
    ...props,
    prefixCls,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
