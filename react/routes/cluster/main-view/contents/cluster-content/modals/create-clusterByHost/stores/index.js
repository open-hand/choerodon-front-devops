import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';

import useStore from './useStore';

const Store = createContext();

export function useFormStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props) => {
    const {
      AppState: { currentMenuType: { id: projectId } },
      children,
      intlPrefix,
      formatMessage,
    } = props;

    const clusterByHostStore = useStore();

    const value = {
      ...props,
      intlPrefix,
      formatMessage,
      projectId,
      clusterByHostStore,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
