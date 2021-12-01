import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { Choerodon, useFormatCommon, useFormatMessage } from '@choerodon/master';
import DetailDataSet from '../../repository/stores/DetailDataSet';
import useStore from './useStore';

const Store = createContext();

export function useRepositoryStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const {
      AppState: { currentMenuType: { id } },
      children,
    } = props;
    const intlPrefix = 'c7ncd.repository';

    const formatRepository = useFormatMessage(intlPrefix);
    const formatCommon = useFormatCommon();

    const url = useMemo(() => `/devops/v1/projects/${id}/project_config`, [id]);

    // eslint-disable-next-line max-len
    const detailDs = useMemo(() => new DataSet(DetailDataSet(formatRepository, formatCommon, url)), [url]);

    const repositoryStore = useStore();

    const value = {
      ...props,
      prefixCls: 'c7ncd-repository',
      permissions: ['choerodon.code.project.setting.setting-repository.ps.default'],
      intlPrefix,
      formatRepository,
      formatCommon,
      promptMsg: formatRepository({ id: 'prompt.inform.title' }) + Choerodon.STRING_DEVIDER + formatRepository({ id: 'prompt.inform.message' }),
      detailDs,
      repositoryStore,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
