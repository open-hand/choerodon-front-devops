import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import uuidv1 from 'uuid';
import FormDataSet from './FormDataSet';
import useStore from './useStore';

const Store = createContext();

export function useCreateAppServiceStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const {
      AppState: { currentMenuType: { projectId } },
      intl: { formatMessage },
      children,
      intlPrefix,
      externalConfigId,
      appServiceId,
    } = props;

    // 确保每次打开弹窗时能够重新请求数据
    const randomString = useMemo(() => uuidv1().substring(0, 5), []);
    const store = useStore();

    const sourceDs = useMemo(() => new DataSet({
      data: [
        {
          text: formatMessage({ id: `${intlPrefix}.source.project` }),
          value: 'normal_service',
        },
        {
          text: formatMessage({ id: `${intlPrefix}.source.organization` }),
          value: 'share_service',
        },
        {
          text: formatMessage({ id: `${intlPrefix}.template.organization` }),
          value: 'organization_template',
        },
        {
          text: formatMessage({ id: `${intlPrefix}.template.site` }),
          value: 'site_template',
        },
      ],
      selection: 'single',
    }), []);

    const formDs = useMemo(() => new DataSet(FormDataSet({
      intlPrefix,
      formatMessage,
      projectId,
      sourceDs,
      store,
      randomString,
      appServiceId,
      externalConfigId,
    })), [projectId, externalConfigId]);

    useEffect(() => {
      appServiceId && loadData();
    }, [appServiceId]);

    function loadData() {
      formDs.setQueryParameter('externalConfigId', externalConfigId);
      formDs.query();
    }

    const value = {
      ...props,
      formDs,
      store,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
