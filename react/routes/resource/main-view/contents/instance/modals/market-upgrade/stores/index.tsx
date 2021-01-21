import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router';
import FormDataSet from './FormDataSet';
import VersionsDataSet from './VersionsDataSet';
import ValueDataSet from './ValueDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  formDs: DataSet,
  valueDs: DataSet,
  versionsDs: DataSet,
  modal: any,
  refresh(): void,
  defaultData: {
    marketAppServiceId: string,
    instanceId: string,
    marketDeployObjectId: string,
    marketServiceName: string,
    environmentId: string,
  }
  location: { search: string },
}

const Store = createContext({} as ContextProps);

export default Store;

export function useUpgradeStore() {
  return useContext(Store);
}

export const StoreProvider = withRouter(injectIntl(inject('AppState')(
  observer((props: any) => {
    const {
      AppState: { currentMenuType: { projectId } },
      children,
      intl: { formatMessage },
      defaultData,
      defaultData: {
        instanceId,
        marketAppServiceId,
        marketDeployObjectId,
        environmentId,
      },
      intlPrefix,
      prefixCls,
    } = props;

    const versionsDs = useMemo(() => new DataSet(VersionsDataSet({
      formatMessage, intlPrefix, projectId, marketDeployObjectId, marketAppServiceId,
    })), [projectId, marketDeployObjectId]);
    const valueDs = useMemo(() => new DataSet(ValueDataSet({
      projectId, marketDeployObjectId, instanceId,
    })), [projectId, instanceId, marketDeployObjectId]);
    const formDs = useMemo(() => new DataSet(FormDataSet({
      formatMessage, intlPrefix, projectId, versionsDs, valueDs,
    })), [projectId]);

    useEffect(() => {
      const record = formDs.current;
      if (record) {
        record.init({
          ...defaultData,
          type: 'update',
        });
      }
    }, []);

    const value = {
      ...props,
      formatMessage,
      prefixCls: `${prefixCls}-instance-market`,
      projectId,
      formDs,
      versionsDs,
      defaultData,
      valueDs,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
)));
