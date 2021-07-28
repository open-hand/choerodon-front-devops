import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';

interface SelectProps {
  projectId: number,
  hostId: string,
}

export default (({ projectId, hostId }: SelectProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  fields: [{
    name: 'user',
    type: 'object' as FieldType,
    textField: 'name',
    valueField: 'id',
    label: '项目成员',
    lookupAxiosConfig: () => ({
      url: '',
      method: 'get',
    }),
  }],
}));
