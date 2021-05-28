import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import some from 'lodash/some';
import FormDataSet from './FormDataSet';

// @ts-ignore
const HAS_BASE_PRO = C7NHasModule('@choerodon/test-pro');

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  formDs: DataSet,
  modal: any,
  refresh(): void,
  hostId?: string,
  showTestTab: boolean,
}

const Store = createContext({} as ContextProps);

export function useCreateHostStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId, categories } },
    hostId,
    hostType,
  } = props;

  const intlPrefix = 'c7ncd.host.config';

  const typeDs = useMemo(() => new DataSet({
    data: [
      {
        text: formatMessage({ id: `${intlPrefix}.type.test` }),
        value: 'distribute_test',
      },
      {
        text: formatMessage({ id: `${intlPrefix}.type.deploy` }),
        value: 'deploy',
      },
    ],
    selection: 'single' as DataSetSelection,
  }), []);
  const accountDs = useMemo(() => new DataSet({
    data: [
      {
        text: formatMessage({ id: `${intlPrefix}.account.password` }),
        value: 'accountPassword',
      },
      {
        text: formatMessage({ id: `${intlPrefix}.account.token` }),
        value: 'publickey',
      },
    ],
    selection: 'single' as DataSetSelection,
  }), []);

  const showTestTab = useMemo(() => HAS_BASE_PRO && some(categories, ['code', 'N_TEST']), [categories, HAS_BASE_PRO]);

  const formDs = useMemo(
    () => new DataSet(FormDataSet({
      formatMessage,
      intlPrefix,
      projectId,
      typeDs,
      accountDs,
      hostId,
      showTestTab,
      hostType,
    })), [projectId],
  );

  useEffect(() => {
    if (hostId) {
      formDs.query();
    } else {
      formDs.create();
    }
  }, [projectId, hostId]);

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'c7ncd-host-config-create',
    formatMessage,
    projectId,
    formDs,
    showTestTab,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
