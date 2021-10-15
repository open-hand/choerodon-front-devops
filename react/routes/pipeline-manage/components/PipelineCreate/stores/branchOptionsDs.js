import { appServiceApiConfig } from '@/api/AppService';

export default () => ({
  selection: 'single',
  pageSize: 5,
  paging: true,
  transport: {
    read({ data, params: { page, pageSize } }) {
      return appServiceApiConfig.getBrachs(data.appServiceId);
    },
  },
  autoQuery: false,
});
