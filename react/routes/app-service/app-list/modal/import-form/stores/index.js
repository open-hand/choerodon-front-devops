import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import some from 'lodash/some';
import ImportDataSet from './ImportDataSet';
import ImportTableDataSet from './ImportTableDataSet';
import selectedDataSet from './SelectedDataSet';
import useStore from './useStore';
import MarketSelectedDataSet from './MarketSelectedDataSet';

const Store = createContext();

export function useImportAppServiceStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const {
      AppState: { currentMenuType: { projectId, organizationId }, currentServices, isSaasList },
      intl: { formatMessage },
      children,
      intlPrefix,
    } = props;

    const hasMarket = useMemo(() => some(currentServices || [], ['serviceCode', 'market-service']), [currentServices]);
    const isSaaS = isSaasList && isSaasList[organizationId];

    const serviceTypeDs = useMemo(() => new DataSet({
      data: [
        {
          text: formatMessage({ id: `${intlPrefix}.type.normal` }),
          value: 'normal',
        },
        {
          text: formatMessage({ id: `${intlPrefix}.type.test` }),
          value: 'test',
        },
      ],
      selection: 'single',
    }), []);
    const importStore = useStore();
    const importTableDs = useMemo(() => new DataSet(ImportTableDataSet({
      intlPrefix, formatMessage, projectId,
    })), [projectId]);
    const selectedDs = useMemo(() => new DataSet(selectedDataSet({
      intlPrefix, formatMessage, projectId, importStore,
    })), [projectId]);
    const marketSelectedDs = useMemo(() => new DataSet(MarketSelectedDataSet({
      intlPrefix, formatMessage, projectId, importStore,
    })), [projectId]);
    const importDs = useMemo(() => new DataSet(ImportDataSet({
      intlPrefix,
      formatMessage,
      projectId,
      serviceTypeDs,
      selectedDs,
      importTableDs,
      marketSelectedDs,
    })), [projectId]);

    const value = {
      ...props,
      IMPORT_METHOD: isSaaS ? ['share', 'github', 'gitlab'] : ['share', 'market', 'github', 'gitlab'],
      importDs,
      importTableDs,
      selectedDs,
      importStore,
      marketSelectedDs,
      hasMarket,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
