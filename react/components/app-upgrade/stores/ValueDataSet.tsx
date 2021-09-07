/* eslint-disable import/no-anonymous-default-export */
import { DataSetProps } from '@/interface';

interface ValueProps {
  projectId: number,
  instanceId: string,
  marketDeployObjectId: string,
}

export default ({
  projectId, instanceId, marketDeployObjectId,
}: ValueProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: ({ data }) => ({
      url: `/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/upgrade_value?market_deploy_object_id=${data.market_deploy_object_id || marketDeployObjectId}`,
      method: 'get',
    }),
  },
});
