import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { v1 as uuidv1 } from 'uuid';
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

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    templateId,
    AppState: { currentMenuType: { organizationId: orgId } },
    pageType,
    intl: { formatMessage },
  } = props;

  const organizationId = useMemo(() => (pageType === 'organization' ? orgId : null), [pageType, orgId]);

  // 确保每次打开弹窗时能够重新请求数据
  const randomString = useMemo(() => uuidv1().substring(0, 5), []);

  const formDs = useMemo(() => new DataSet(FormDataSet({
    templateId, organizationId, randomString,
  })), [templateId]);

  useEffect(() => {
    if (templateId) {
      formDs.query();
    } else {
      formDs.create();
    }
  }, []);

  const value = {
    ...props,
    formatMessage,
    formDs,
    templateId,
    organizationId,
    prefixCls: 'c7ncd-template-form',
    intlPrefix: 'c7ncd.template',
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
