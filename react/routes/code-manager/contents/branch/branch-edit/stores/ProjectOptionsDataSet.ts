import { DataSetProps, DataSetSelection } from '@/interface';

interface OptionProps {
  organizationId: number,
  userId: number,
  projectId: number
}

export default ({ organizationId, userId }: OptionProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: 'single' as DataSetSelection,
  pageSize: 5,
  transport: {
    read: {
      url: `/iam/choerodon/v1/organizations/${organizationId}/users/${userId}/projects/paging?enabled=true`,
      method: 'get',
    },
  },
});
