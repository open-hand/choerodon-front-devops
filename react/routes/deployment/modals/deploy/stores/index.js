import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { DataSet } from 'choerodon-ui/pro';
import some from 'lodash/some';
import find from 'lodash/find';
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
      AppState: {
        currentMenuType: { projectId, organizationId, categories },
        currentServices,
        isSaasList,
      },
      intl: { formatMessage },
      children,
      intlPrefix,
      deployStore,
      envId,
      hasHostDeploy,
      random,
      appServiceId,
      marketAppVersionId,
      marketServiceId,
      appServiceSource,
    } = props;

    const deployUseStore = useStore();
    const hasDevops = useMemo(() => some(categories || [], ['code', 'N_DEVOPS']), [categories]);
    const hasMarket = useMemo(() => some(currentServices || [], ['serviceCode', 'market-service']), [currentServices]);
    const isSaaS = isSaasList && isSaasList[organizationId];

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
      random,
      appServiceSource,
    })), [projectId]);

    useEffect(() => {
      envOptionsDs.transport.read.url = `/devops/v1/projects/${projectId}/envs/list_by_active?active=true`;
      envOptionsDs.query();
      !isSaaS && hasMarket && loadMarketAndVersion();
    }, [projectId]);

    useEffect(() => {
      if (appServiceSource) {
        if (appServiceSource === 'market_service') {
          if (marketAppVersionId && marketServiceId) {
            marketServiceOptionsDs.setQueryParameter('marketVersionId', marketAppVersionId);
            loadMarketService();
          }
        } else if (appServiceId) {
          manualDeployDs.current?.set('appServiceId', appServiceId);
        }
      }
    }, []);

    const loadMarketAndVersion = useCallback(async () => {
      marketAndVersionOptionsDs.setQueryParameter('application_type', 'common');
      await marketAndVersionOptionsDs.query();
      if (appServiceSource === 'market_service' && marketAppVersionId) {
        let marketData;
        let groupName;
        marketAndVersionOptionsDs.some((optionRecord) => {
          const item = find(optionRecord.get('appVersionVOS') || [], (vo) => vo?.id === marketAppVersionId);
          if (item) {
            marketData = item;
            groupName = optionRecord.get('name');
            return true;
          }
          return false;
        });
        if (marketData) {
          manualDeployDs.current?.init('marketAppAndVersion', {
            value: marketData,
            meaning: marketData.versionNumber,
            ['group-0']: groupName,
          });
        }
      }
    }, []);

    const loadMarketService = useCallback(async () => {
      await marketServiceOptionsDs.query();
      const record = marketServiceOptionsDs.find((optionRecord) => optionRecord.get('id') === marketServiceId);
      if (record) {
        manualDeployDs.current?.set('marketService', record.toData());
      }
    }, []);

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
      isSaaS,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
)));
