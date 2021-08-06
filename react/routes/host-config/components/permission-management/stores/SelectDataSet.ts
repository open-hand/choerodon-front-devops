import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

interface SelectProps {
  projectId: number,
  hostId: string,
  formatMessage(arg0: object, arg1?: object): string,
  random: number,
}

export default (({
  projectId, hostId, formatMessage, random,
}: SelectProps): DataSetProps => ({
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
        url: HostConfigApi.getHostNonRelated(projectId, hostId, random),
        method: 'post',
        data: name ? { params: [name], searchParam: {} } : null,
      });
    },
  }],
}));
