import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { DataSet } from 'choerodon-ui/pro';
import some from 'lodash/some';
import useStore from './useStore';
import ManualDeployDataSet from './ManualDeployDataSet';
import OptionsDataSet from '../../../stores/OptionsDataSet';
import NetworkDataSet from './NetworkDataSet';
import PortDataSet from './PortDataSet';
import PathListDataSet from './PathListDataSet';
import DomainDataSet from './DomainDataSet';
import AnnotationDataSet from './AnnotationDataSet';
import MarketAndVersionOptionsDataSet from './MarketAndVersionOptionsDataSet';
import MarketServiceOptionsDataSet from './MarketServiceOptionsDataSet';

const Store = createContext();

export function useManualDeployStore() {
  return useContext(Store);
}

export const StoreProvider = withRouter(injectIntl(inject('AppState')(
  (props) => {
    const {
      AppState: { currentMenuType: { projectId, organizationId, categories }, currentServices },
      intl: { formatMessage },
      children,
      intlPrefix,
      deployStore,
      envId,
      hasHostDeploy,
    } = props;

    const deployUseStore = useStore();
    const hasDevops = useMemo(() => some(categories || [], ['code', 'N_DEVOPS']), [categories]);
    const hasMarket = useMemo(() => some(currentServices || [], ['serviceCode', 'market-service']), [currentServices]);

    const envOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);
    const valueIdOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);
    const versionOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);

    const pathListDs = useMemo(() => new DataSet(PathListDataSet({ formatMessage, projectId })),
      [projectId]);
    const annotationDs = useMemo(() => new DataSet(AnnotationDataSet({ formatMessage })), []);
    const domainDs = useMemo(() => new DataSet(DomainDataSet({
      formatMessage, projectId, pathListDs, annotationDs,
    })), [projectId]);
    const portsDs = useMemo(() => new DataSet(PortDataSet({ formatMessage, pathListDs })), []);
    const networkDs = useMemo(() => new DataSet(NetworkDataSet({
      formatMessage, projectId, portsDs, pathListDs,
    })), []);

    const marketAndVersionOptionsDs = useMemo(
      () => new DataSet(MarketAndVersionOptionsDataSet(projectId), []),
    );
    const marketServiceOptionsDs = useMemo(
      () => new DataSet(MarketServiceOptionsDataSet(projectId), []),
    );

    const manualDeployDs = useMemo(() => new DataSet(ManualDeployDataSet({
      intlPrefix,
      formatMessage,
      projectId,
      envOptionsDs,
      valueIdOptionsDs,
      versionOptionsDs,
      deployStore,
      networkDs,
      domainDs,
      organizationId,
      deployUseStore,
      hasHostDeploy,
      marketAndVersionOptionsDs,
      marketServiceOptionsDs,
      hasDevops,
    })), [projectId]);

    useEffect(() => {
      envOptionsDs.transport.read.url = `/devops/v1/projects/${projectId}/envs/list_by_active?active=true`;
      envOptionsDs.query();
      hasMarket && marketAndVersionOptionsDs.query();
    }, [projectId]);

    const value = {
      ...props,
      manualDeployDs,
      portsDs,
      networkDs,
      pathListDs,
      domainDs,
      annotationDs,
      deployUseStore,
      marketAndVersionOptionsDs,
      hasDevops,
      hasMarket,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
)));
