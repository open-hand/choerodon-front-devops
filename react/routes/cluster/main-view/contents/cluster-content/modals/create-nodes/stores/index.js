/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import NodeDataSet from './NodeDataSet';

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

    const accountDs = useMemo(() => new DataSet({
      data: [
        {
          text: formatMessage({ id: `${intlPrefix}.nodesCreate.account.password` }),
          value: 'accountPassword',
        },
        {
          text: formatMessage({ id: `${intlPrefix}.nodesCreate.account.token` }),
          value: 'publickey',
        },
      ],
      selection: 'single',
    }), []);

    const nodesTypeDs = useMemo(() => new DataSet({
      data: [
        {
          text: 'master',
          value: 'master',
        },
        {
          text: 'etcd',
          value: 'etcd',
        },
        {
          text: 'worker',
          value: 'worker',
        },
      ],
      selection: 'multiple',
    }));

    const nodesDs = useMemo(() => new DataSet(NodeDataSet({
      ...props,
      accountDs,
      formatMessage,
      intlPrefix,
      nodesTypeDs,
    }), [projectId]));

    const value = {
      ...props,
      nodesDs,
      intlPrefix,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
