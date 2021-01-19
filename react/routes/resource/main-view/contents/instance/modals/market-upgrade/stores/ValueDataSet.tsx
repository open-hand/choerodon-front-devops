import { DataSetProps } from '@/interface';

interface ValueProps {
  projectId: number,
  marketAppServiceId: string,
  marketDeployObjectId: string,
}

export default ({
  projectId, marketAppServiceId, marketDeployObjectId,
}: ValueProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: ({ data }) => ({
      url: `/devops/v1/projects/${projectId}/app_service_instances/${marketAppServiceId}/upgrade_value?market_deploy_object_id=${data.market_deploy_object_id || marketDeployObjectId}`,
      method: 'get',
    }),
  },
});
