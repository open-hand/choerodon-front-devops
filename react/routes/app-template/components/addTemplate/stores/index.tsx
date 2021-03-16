import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import TemplateOptionsDataSet from './TemplateOptionsDataSet';
import FormDataSet from './FormDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  formDs: DataSet,
  templateId: string,
  modal: any,
  refresh(): void,
  organizationId?: number,
}

const Store = createContext({} as ContextProps);

export function useAddTemplateStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props) => {
  const {
    children,
    templateId,
    AppState: { currentMenuType: { organizationId: orgId } },
    pageType,
  } = props;

  const organizationId = useMemo(() => (pageType === 'organization' ? orgId : null), [pageType, orgId]);

  const templateOptionsDs = useMemo(() => new DataSet(TemplateOptionsDataSet('site', organizationId)), []);
  const orgTemplateOptionsDs = useMemo(
    () => new DataSet(TemplateOptionsDataSet('organization', organizationId)), [organizationId],
  );
  const formDs = useMemo(() => new DataSet(FormDataSet({
    templateId, templateOptionsDs, orgTemplateOptionsDs, organizationId,
  })), [templateId]);

  useEffect(() => {
    if (templateId) {
      formDs.query();
    } else {
      formDs.create();
      templateOptionsDs.query();
      if (organizationId) {
        orgTemplateOptionsDs.query();
      }
    }
  }, []);

  const value = {
    ...props,
    formDs,
    templateId,
    organizationId,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
