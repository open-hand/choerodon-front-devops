import { appServiceApiConfig } from '@/api/AppService';

export default () => ({
  selection: 'single',
  transport: {
    read({ data }) {
      return appServiceApiConfig.getBrachs(data.appServiceId);
    },
  },
  autoQuery: false,
});
