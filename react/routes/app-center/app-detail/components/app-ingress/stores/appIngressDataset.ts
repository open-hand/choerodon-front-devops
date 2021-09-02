/* eslint-disable import/no-anonymous-default-export */
import Apis from '@/routes/app-center/apis';

export default ({ projectId, hostId, appServiceId }:any):any => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: {
      url: Apis.getAppIngress(projectId, appServiceId, hostId),
      method: 'get',
    },
  },
});
