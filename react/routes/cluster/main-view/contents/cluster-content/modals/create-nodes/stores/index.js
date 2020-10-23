/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import NodeDataSet from '../../stores/NodeDataSet';
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
      modal,
    } = props;

    const nodeStore = useStore();

    const value = {
      ...props,
      nodeStore,
      intlPrefix,
      projectId,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
