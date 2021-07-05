import { DataSetProps } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

interface ListProps {
  projectId: number,
}

export default ({ projectId }: ListProps): DataSetProps => ({
  autoCreate: false,
  selection: false,
  transport: {
    read: ({ data }) => {
      const { hostId } = data;
      return {
        url: HostConfigApi.getResourceInfo(projectId, hostId),
        method: 'get',
      };
    },
  },
});
