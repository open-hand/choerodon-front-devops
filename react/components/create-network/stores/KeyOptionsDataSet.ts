/* eslint-disable import/no-anonymous-default-export */
import { flatMap } from 'lodash';

export default (projectId: any, envId: any, appId: any) => ({
  autoQuery: true,
  transport: {
    read: {
      method: 'get',
      url: `/devops/v1/projects/${projectId}/env/app_services/list_label?env_id=${envId}&app_service_id=${appId}`,
      transformResponse: (resp: string) => {
        try {
          const data = JSON.parse(resp);
          if (data && data.failed) {
            return data;
          } if (data.length > 0) {
            return flatMap(data[0], (value: any, key: any) => ({
              meaning: `${key}:${value}`,
              value: `${value}`,
              key: `${key}`,
            }));
          }
          return data;
        } catch (e) {
          return resp;
        }
      },
    },
  },
});
