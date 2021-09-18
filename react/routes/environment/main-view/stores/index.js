import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useEnvironmentStore } from '../../stores';
import GroupFormDataSet from './GroupFormDataSet';
import { environmentApiApi } from '@/api/Environment';
import useStore from './useStore';

const Store = createContext();

export function useMainStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { intlPrefix } = useEnvironmentStore();
    const {
      AppState: { currentMenuType: { id: projectId } },
      intl: { formatMessage },
      children,
    } = props;
    const mainStore = useStore();
    const groupFormDs = useMemo(() => new DataSet(GroupFormDataSet(
      { formatMessage, intlPrefix, projectId },
    )), [projectId]);

    const [createEnvBtnDisable, setCreateEnvBtnDisable] = useState(false);

    const getCreateEnvDisable = () => {
      environmentApiApi.getCreateEnvDisable().then((res) => {
        setCreateEnvBtnDisable(!res);
      });
    };
    const value = {
      ...props,
      mainStore,
      groupFormDs,
      createEnvBtnDisable,
      getCreateEnvDisable,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
