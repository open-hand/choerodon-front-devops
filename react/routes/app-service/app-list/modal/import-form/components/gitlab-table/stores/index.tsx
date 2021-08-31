import React, {
  createContext, useContext, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import gitlabDataSet from './GitlabDataSet';

  interface ContextProps {
    prefixCls: string,
    intlPrefix: string,
    formatMessage(arg0: object, arg1?: object): string,
    projectId: number,
    refresh(callback?:CallableFunction):void,
    modal: any,
    tableDs: DataSet,
    selectedDs: DataSet,
  }

const Store = createContext({} as ContextProps);

export function useGitlabTableStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    projectId,
    intl: { formatMessage },
    importRecord,
    selectedDs,
  } = props;
  const intlPrefix = 'c7ncd.appService.gitlab';
  const gitlabGroupValue = importRecord.get('gitlabTemplate')?.id;
  const tableDs = useMemo(() => new DataSet(gitlabDataSet({
    formatMessage, projectId, gitlabGroupValue, intlPrefix, selectedDs,
  })), [projectId]);

  const value = {
    ...props,
    formatMessage,
    intlPrefix,
    prefixCls: 'c7ncd-appService-gitlab',
    tableDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
