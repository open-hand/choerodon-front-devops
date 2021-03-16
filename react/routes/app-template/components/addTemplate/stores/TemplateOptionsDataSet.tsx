import { DataSetProps, DataSetSelection } from '@/interface';
import TemplateApis from '@/routes/app-template/apis';

export default (type: string, organizationId?: number): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  selection: 'single' as DataSetSelection,
  transport: {
    read: {
      url: !organizationId
        ? TemplateApis.getTemplateList()
        : TemplateApis.getOrgTemplateList(type, organizationId),
      method: 'get',
    },
  },
});
