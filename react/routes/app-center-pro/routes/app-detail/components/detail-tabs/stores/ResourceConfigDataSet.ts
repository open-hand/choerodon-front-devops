import { deployAppCenterApiConfig } from '@/api';

const ResourceConfigDs = ({
  appCenterId,
}:{
  projectId:string
  appCenterId:string,
}) => ({
  autoQuery: false,
  pageSize: 10,
  transport: {
    read: deployAppCenterApiConfig.loadEnvChartService(appCenterId),
  },
});

export default ResourceConfigDs;
