import { DataSetProps } from '@/interface';
import { DataSet } from 'choerodon-ui/pro';
import getTablePostData from '@/utils/getTablePostData';
import TemplateApis from '../apis';

interface TableProps {
  organizationId?: number,
}

const statusDs = new DataSet({
  data: [{
    value: '1',
    text: '启用',
  }, {
    value: '0',
    text: '停用',
  }, {
    value: '2',
    text: '创建中',
  }, {
    value: '-1',
    text: '失败',
  }],
});

const sourceDs = new DataSet({
  data: [{
    value: 'P',
    text: '预定义',
  }, {
    value: 'C',
    text: '自定义',
  }],
});

const mapping = {
  appTemplate: {
    name: 'name',
    type: 'string',
    label: '应用模板',
  },
  temCode: {
    name: 'code',
    type: 'string',
    label: '模板编码',
  },
  repo: {
    name: 'gitlabUrl',
    type: 'string',
    label: '仓库地址',
  },
  source: {
    name: 'type',
    type: 'string',
    label: '来源',
  },
  createTime: {
    name: 'creationDate',
    type: 'string',
    label: '创建时间',
  },
  status: {
    name: 'status',
    type: 'string',
    label: '状态',
  },
};

export { mapping };

export default ({ organizationId }: TableProps): DataSetProps => ({
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
  fields: Object.keys(mapping).map((key) => mapping[key]),
  queryFields: [
    { name: 'name', label: '名称' },
    { name: 'code', label: '编码' },
    { name: 'gitlabUrl', label: '仓库地址' },
    {
      name: 'type', label: '来源', options: sourceDs, textField: 'text', valueField: 'value',
    },
    {
      name: 'enable', label: '状态', options: statusDs, textField: 'text', valueField: 'value',
    },
  ],
});
