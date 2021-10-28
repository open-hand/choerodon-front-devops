import { appServiceApiConfig } from '@/api/AppService';

export default () => ({
  selection: 'single',
  pageSize: 5,
  paging: true,
  transport: {
    read({ data, params: { page, pageSize } }) {
      const { key } = data;
      const res = { searchParam: { branchName: key } };
      return appServiceApiConfig.getBrachs(data.appServiceId, res);
    },
  },
  autoQuery: false,
});
