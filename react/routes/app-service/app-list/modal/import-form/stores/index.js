/* eslint-disable */
import React, {
  createContext, useContext, useMemo,
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
import { GitlabSelectedDs, TypeOptionDs } from './GitlabSelectedDs';
import shareImage from '../../../../images/share.svg';
import marketImage from '../../../../images/market.svg';
import githubImage from '../../../../images/github.svg';
import gitlabImage from '../../../../images/gitlab.svg';
import gerneralGitImage from '../../../../images/generalGit.svg';

const Store = createContext();

export function useImportAppServiceStore() {
  return useContext(Store);
}

const hasMarketService = !window._env_.NON_INSTALL_MARKET;

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
    const typeOptionDs = useMemo(() => new DataSet(TypeOptionDs()), []);
    const gitlabSelectedDs = useMemo(() => new DataSet(GitlabSelectedDs({
      intlPrefix, formatMessage, projectId, importStore, typeOptionDs,
    })), [projectId]);
    const importDs = useMemo(() => new DataSet(ImportDataSet({
      intlPrefix,
      formatMessage,
      projectId,
      serviceTypeDs,
      selectedDs,
      importTableDs,
      marketSelectedDs,
      gitlabSelectedDs,
    })), [projectId]);
    const IMPORT_METHOD_LIST = isSaaS ? [{ type: 'share', img: shareImage }, { type: 'github', img: gitlabImage }, { type: 'gitlab', img: gitlabImage }] : [{ type: 'github', img: githubImage }, { type: 'gitlab', img: gitlabImage }, { type: 'gerneralGit', img: gerneralGitImage }, { type: 'share', img: shareImage }];

    if (!isSaaS) {
      if (hasMarketService) {
        IMPORT_METHOD_LIST.push({ type: 'market', img: marketImage });
      }
    }

    const value = {
      ...props,
      IMPORT_METHOD: IMPORT_METHOD_LIST,
      importDs,
      importTableDs,
      selectedDs,
      importStore,
      marketSelectedDs,
      gitlabSelectedDs,
      hasMarket,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
