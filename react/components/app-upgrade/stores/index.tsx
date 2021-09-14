import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router';
import FormDataSet from './FormDataSet';
import HzeroFormDataSet from './HzeroFormDataSet';
import VersionsDataSet from './VersionsDataSet';
import ValueDataSet from './ValueDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  formDs: DataSet,
  formDsHzero: DataSet,
  valueDs: DataSet,
  versionsDs: DataSet,
  modal: any,
  refresh(): void,
  isHzero: boolean,
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
      isMiddleware = false,
      isHzero = false,
    } = props;

    const prefixCls = 'c7ncd-deployment';
    const intlPrefix = 'c7ncd.deployment';

    const versionsDs = useMemo(() => new DataSet(VersionsDataSet({
      formatMessage, intlPrefix, projectId, marketDeployObjectId, marketAppServiceId,
    })), [projectId, marketDeployObjectId]);

    const valueDs = useMemo(() => new DataSet(ValueDataSet({
      projectId, marketDeployObjectId, instanceId,
    })), [projectId, instanceId, marketDeployObjectId]);

    const formDs = useMemo(() => new DataSet(FormDataSet({
      formatMessage, intlPrefix, projectId, versionsDs, valueDs, isMiddleware, isHzero,
    })), [projectId]);

    const formDsHzero = useMemo(() => new DataSet(HzeroFormDataSet({
      formatMessage, intlPrefix, projectId, versionsDs, isMiddleware, isHzero, instanceId,
    })), [projectId]);

    useEffect(() => {
      const record = formDs.current;
      const recordHzero = formDsHzero.current;
      if (record) {
        record.init({
          ...defaultData,
          type: 'update',
        });
      }
      if (recordHzero) {
        recordHzero.init({
          ...defaultData,
          type: 'update',
          marketDeployObjectId: '',
        });
      }
      loadVersion();
      loadVersionHzero();
    }, []);

    const loadVersion = useCallback(async () => {
      const record = formDs.current;
      if (!record) {
        return;
      }
      await versionsDs.query();
      versionsDs.forEach((eachRecord) => {
        const versionType = eachRecord.get('versionType');
        if (versionType === 'currentVersion') {
          record.init({
            marketAppName: eachRecord.get('marketAppName'),
            marketAppVersion: eachRecord.get('marketAppVersion'),
          });
        }
        const versionTypeText = versionType
          ? `（${formatMessage({ id: `${intlPrefix}.market.version.${versionType}` })}）`
          : '';
        eachRecord.init('marketServiceVersion', `${eachRecord.get('marketServiceVersion')}${versionTypeText}`);
      });
    }, [formDs.current]);

    const loadVersionHzero = useCallback(async () => {
      const recordHzero = formDsHzero.current;
      if (!recordHzero) {
        return;
      }
      await versionsDs.query();
      versionsDs.forEach((eachRecord) => {
        const versionType = eachRecord.get('versionType');
        if (versionType === 'currentVersion') {
          recordHzero.init({
            marketAppVersion: eachRecord.get('marketAppVersion'),
            hzeroCurrentVersionId: eachRecord.get('id'),
          });
          versionsDs.delete(eachRecord, false);
        } else {
          const versionTypeText = versionType
            ? `（${formatMessage({ id: `${intlPrefix}.market.version.${versionType}` })}）`
            : '';
          eachRecord.init('marketServiceVersion', `${eachRecord.get('marketServiceVersion')}${versionTypeText}`);
          if (versionType === 'lastVersion') {
            recordHzero.init('marketDeployObjectId', `${eachRecord.get('id')}`);
          }
        }
      });
    }, [formDsHzero.current]);

    const value = {
      ...props,
      formatMessage,
      prefixCls: `${prefixCls}-instance-market`,
      projectId,
      formDs,
      versionsDs,
      formDsHzero,
      defaultData,
      valueDs,
      isHzero,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
)));
