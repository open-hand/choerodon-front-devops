/* eslint-disable no-param-reassign */
import { FieldType, DataSet } from '@/interface';

/* eslint-disable import/no-anonymous-default-export */
interface TableProps {
  formatMessage(arg0: object, arg1?: object): string,
  projectId: string,
  gitlabGroupValue:string,
  intlPrefix:string,
  selectedDs:DataSet,
}
export default ({
  intlPrefix, formatMessage, projectId, gitlabGroupValue, selectedDs,
}: TableProps) => ({
  autoQuery: true,
  pageSize: 10,
  transport: {
    read: ({ data, params }: any) => ({
      url: `/devops/v1/projects/215874867621597184/groups/${gitlabGroupValue}/projects`,
      method: 'get',
    }),
  },
  fields: [
    { name: 'name', label: formatMessage({ id: `${intlPrefix}.name` }) },
    {
      name: 'code',
      maxLength: 30,
      label: formatMessage({ id: 'code' }),
    },
    { name: 'lastActivityAt', label: formatMessage({ id: `${intlPrefix}.updateDate` }) },
    {
      name: 'showSizeChanger',
      type: 'boolean' as FieldType,
      label: 'showSizeChanger',
      defaultValue: true,
    },
  ],
  queryFields: [
  ],
  // DS 事件回调
  events: {
    load: ({ dataSet }:any) => {
      dataSet.forEach((titem:any) => {
        selectedDs.forEach((sitem:any) => {
          if (titem.toJSONData().name === sitem.toJSONData().name) {
            titem.isSelected = true;
          }
        });
      });
    },
  },
});
