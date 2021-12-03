import React, {
  createContext, useMemo, useContext,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useFormatMessage, useFormatCommon } from '@choerodon/master';
import TableDataSet from './TableDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tableDs: DataSet,
  organizationId?: number,
  permissionCodes: {
    create: string[],
    edit: string[],
    enable: string[],
    disable: string[],
    permission: string[],
    delete: string[],
  }
  pageType: string,
  format:(arg0?:object, arg1?:object)=>{};
  formatCommon:(arg0?:object, arg1?:object)=>{};
}

const Store = createContext({} as ContextProps);

export function useAppTemplateStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { organizationId: orgId } },
    pageType,
  } = props;
  const intlPrefix = 'c7ncd.template';
  const format = useFormatMessage(intlPrefix);
  const formatCommon = useFormatCommon(intlPrefix);
  const organizationId = useMemo(() => (pageType === 'organization' ? orgId : null), [pageType, orgId]);
  const permissionCodes = useMemo(() => (organizationId ? {
    create: ['choerodon.code.organization.manager.application-template.ps.create'],
    edit: ['choerodon.code.organization.manager.application-template.ps.edit'],
    enable: ['choerodon.code.organization.manager.application-template.ps.enable'],
    disable: ['choerodon.code.organization.manager.application-template.ps.disable'],
    permission: ['choerodon.code.organization.manager.application-template.ps.permission'],
    delete: ['choerodon.code.organization.manager.application-template.ps.delete'],
  } : {
    create: ['choerodon.code.site.manager.application-template.ps.create'],
    edit: ['choerodon.code.site.manager.application-template.ps.edit'],
    enable: ['choerodon.code.site.manager.application-template.ps.enable'],
    disable: ['choerodon.code.site.manager.application-template.ps.disable'],
    permission: ['choerodon.code.site.manager.application-template.ps.permission'],
    delete: ['choerodon.code.site.manager.application-template.ps.delete'],
  }), [organizationId]);

  const tableDs = useMemo(() => new DataSet((TableDataSet({
    organizationId,
    formatCommon,
    format,
  }))), [organizationId]);

  const value = {
    ...props,
    prefixCls: 'c7ncd-template',
    intlPrefix,
    formatMessage,
    tableDs,
    organizationId,
    permissionCodes,
    formatCommon,
    format,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
