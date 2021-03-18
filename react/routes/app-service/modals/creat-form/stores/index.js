import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import FormDataSet from './FormDataSet';
import useStore from './useStore';
import TemplateOptionsDataSet from './TemplateOptionsDataSet';

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
    } = props;

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

    const siteTemplateOptionsDs = useMemo(() => new DataSet(TemplateOptionsDataSet(projectId, 'site')), [projectId]);
    const orgTemplateOptionsDs = useMemo(() => new DataSet(TemplateOptionsDataSet(projectId, 'organization')), [projectId]);
    const formDs = useMemo(() => new DataSet(FormDataSet({
      intlPrefix,
      formatMessage,
      projectId,
      sourceDs,
      store,
      siteTemplateOptionsDs,
      orgTemplateOptionsDs,
    })), [projectId]);

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
