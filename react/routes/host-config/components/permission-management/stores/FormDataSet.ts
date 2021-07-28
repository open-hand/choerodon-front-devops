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
    name: 'skipCheckPermission',
  }],
}));
