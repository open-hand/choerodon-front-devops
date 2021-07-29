import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

interface SelectProps {
  projectId: number,
  hostId: string,
  formatMessage(arg0: object, arg1?: object): string,
}

export default (({ projectId, hostId, formatMessage }: SelectProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  fields: [{
    name: 'user',
    type: 'object' as FieldType,
    textField: 'realName',
    valueField: 'iamUserId',
    label: formatMessage({ id: 'member' }),
    lookupAxiosConfig: ({ params }) => {
      const { name } = params || {};
      return ({
        url: HostConfigApi.getHostNonRelated(projectId, hostId),
        method: 'post',
        data: name ? { params: [name], searchParam: {} } : null,
      });
    },
  }],
}));
