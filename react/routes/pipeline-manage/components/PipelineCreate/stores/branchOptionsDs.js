import { appServiceApiConfig } from '@/api/AppService';

export default () => ({
  selection: 'single',
  transport: {
    read({ params: { page, params } }) {
      return appServiceApiConfig.getBrachs(params, page);
    },
  },
  autoQuery: false,
});
