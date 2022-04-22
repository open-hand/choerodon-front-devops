import { hostApi, hostApiConfig } from '@/api';

const Index = () => ({
  autoQuery: false,
  transport: {
    read: ({ data }: any) => {
      const type = data?.data;
      return hostApiConfig.loadHostsAppList(type || '');
    },
  },
});

export default Index;
