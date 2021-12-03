import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps } from '@/interface';
import getTablePostData from '@/utils/getTablePostData';
import TemplateApis from '../apis';

interface TableProps {
  organizationId?: number,
  formatCommon:(arg0?:object, arg1?:object)=>{},
  format:(arg0?:object, arg1?:object)=>{},
}

const mapping = {
  appTemplate: {
    name: 'name',
    type: 'string',
    label: 'applicationTemplate',
  },
  temCode: {
    name: 'code',
    type: 'string',
    label: 'templateCode',
  },
  repo: {
    name: 'gitlabUrl',
    type: 'string',
    label: 'warehouseAddress',
  },
  source: {
    name: 'type',
    type: 'string',
    label: 'resource',
  },
  createTime: {
    name: 'creationDate',
    type: 'string',
    label: 'createTime',
  },
  status: {
    name: 'status',
    type: 'string',
    label: 'status',
  },
} as const;

export { mapping };

const TableDataSet = ({ organizationId, formatCommon, format }: TableProps): DataSetProps => {
  const statusDs = new DataSet({
    data: [{
      value: '1',
      text: formatCommon({ id: 'enable' }),
    }, {
      value: '0',
      text: formatCommon({ id: 'stop' }),
    }, {
      value: '2',
      text: formatCommon({ id: 'creating' }),
    }, {
      value: '-1',
      text: formatCommon({ id: 'failed' }),
    }],
  });
  const sourceDs = new DataSet({
    data: [{
      value: 'P',
      text: formatCommon({ id: 'predefined' }),
    }, {
      value: 'C',
      text: formatCommon({ id: 'custom' }),
    }],
  });

  return ({
    selection: false,
    autoCreate: false,
    autoQuery: true,
    paging: true,
    transport: {
      read: ({ data }) => {
        const postData = getTablePostData(data);

        return ({
          url: TemplateApis.getTemplateTable(organizationId),
          method: 'post',
          data: postData,
        });
      },
      destroy: ({ data: [data] }) => ({
        url: TemplateApis.deleteTemplate(data.id, organizationId),
        method: 'delete',
      }),
    },
    // @ts-ignore
    // fields: Object.keys(mapping).map((key) => mapping[key]),
    fields: Object.keys(mapping).map((key:keyof typeof mapping) => ({
      name: mapping[key].name,
      type: 'string',
      label: format({ id: mapping[key].label }),
    })),
    queryFields: [
      { name: 'name', label: formatCommon({ id: 'name' }) },
      { name: 'code', label: formatCommon({ id: 'code' }) },
      { name: 'gitlabUrl', label: format({ id: 'warehouseAddress' }) },
      {
        name: 'type', label: formatCommon({ id: 'source' }), options: sourceDs, textField: 'text', valueField: 'value',
      },
      {
        name: 'enable', label: formatCommon({ id: 'states' }), options: statusDs, textField: 'text', valueField: 'value',
      },
    ],
  });
};
export default TableDataSet;
