import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet as DataSetProps, DataSetSelection } from '@/interface';
import FormDataSet from './FormDataSet';

interface ContentProps {
  intlPrefix: string,
  prefixCls: string,
  intl: { formatMessage(arg0: object): string },
  formDs: DataSetProps,
  envName: string,
  modal: any,
  refresh(): void,
  workloadId?: string,
}

const Store = createContext({} as ContentProps);

export function useCreateWorkloadStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
    resourceStore,
    intlPrefix,
    prefixCls,
    workloadId,
    envName,
  } = props;
  const {
    getSelectedMenu: { parentId },
  } = resourceStore;

  const createTypeDs = useMemo(() => new DataSet({
    data: [{
      text: formatMessage({ id: `${intlPrefix}.workload.create.type.copy` }),
      value: 'paste',
    }, {
      text: formatMessage({ id: `${intlPrefix}.workload.create.type.upload` }),
      value: 'upload',
    }],
    selection: 'single' as DataSetSelection,
  }), []);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    projectId, envId: parentId, workloadId, formatMessage, intlPrefix, createTypeDs, envName,
  })), [projectId, parentId]);

  useEffect(() => {
    if (workloadId) {
      formDs.query();
    } else {
      formDs.create();
    }
  }, [parentId]);

  const value = {
    ...props,
    formDs,
    prefixCls: `${prefixCls}-workload-create`,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
