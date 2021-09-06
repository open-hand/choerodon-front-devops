import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import BatchDeployDataSet from './BatchDeployDataSet';
import OptionsDataSet from './OptionsDataSet';
import NetworkDataSet from './NetworkDataSet';
import PortDataSet from './PortDataSet';
import PathListDataSet from './PathListDataSet';
import DomainDataSet from './DomainDataSet';
import AnnotationDataSet from './AnnotationDataSet';
import useStore, { StoreProps } from './useStore';

type BatchDeployContext = {
  modal: any
  envId: string
  prefixCls:string
  intlPrefix:string
  refresh:(...args:any[])=>any
  deployStore:StoreProps
  batchDeployDs: DataSet
  pathListDs: DataSet
  portsDs: DataSet
  networkDs: DataSet
  annotationDs: DataSet
  domainDs: DataSet
  formatMessage(arg0: object, arg1?: object): string,
}

const Store = createContext({} as BatchDeployContext);

export function useBatchDeployStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props:any) => {
    const {
      AppState: { currentMenuType: { projectId } },
      intl: { formatMessage },
      children,
    } = props;

    const prefixCls = 'c7ncd-deploy';
    const intlPrefix = 'c7ncd.deploy';

    const deployStore = useStore();

    const envOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);
    const valueIdOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);

    const pathListDs = useMemo(
      () => new DataSet(PathListDataSet({ formatMessage, projectId })), [projectId],
    );

    const annotationDs = useMemo(() => new DataSet(AnnotationDataSet({ formatMessage })), []);
    const domainDs = useMemo(() => new DataSet(DomainDataSet({
      formatMessage, projectId, pathListDs, annotationDs,
    })), [projectId]);
    const portsDs = useMemo(() => new DataSet(PortDataSet({ formatMessage, pathListDs })), []);
    const networkDs = useMemo(() => new DataSet(NetworkDataSet({
      formatMessage, projectId, portsDs, pathListDs,
    })), []);
    const batchDeployDs = useMemo(() => new DataSet(BatchDeployDataSet({
      intlPrefix,
      formatMessage,
      projectId,
      envOptionsDs,
      valueIdOptionsDs,
      deployStore,
      networkDs,
      domainDs,
    })), [projectId]);

    useEffect(() => {
      // @ts-expect-error
      envOptionsDs.transport.read.url = `/devops/v1/projects/${projectId}/envs/list_by_active?active=true`;
      envOptionsDs.query();

      deployStore.loadAppService(projectId, 'normal_service');
      deployStore.loadShareAppService(projectId);
    }, [projectId]);

    const value = {
      ...props,
      batchDeployDs,
      portsDs,
      networkDs,
      pathListDs,
      domainDs,
      annotationDs,
      prefixCls,
      intlPrefix,
      formatMessage,
      deployStore,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
