import {
  DataSetProps, RecordObjectProps, DataSet, Record,
} from '@/interface';
import TemplateApis from '@/routes/app-template/apis';
import TemplateServices from '@/routes/app-template/services';

interface FormProps {
  templateId: string,
  templateOptionsDs: DataSet,
  organizationId?: number,
}

interface ValidatorProps {
  value: string,
  name?: string,
  record?: Record,
  organizationId?: number,
  templateId?: string,
}

const codeValidator = async ({ value, organizationId, templateId }: ValidatorProps) => {
  const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
  if (value && !templateId) {
    if (pa.test(value)) {
      try {
        const res = await TemplateServices.checkNameOrCode({ type: 'code', value, organizationId });
        if ((res && res.failed) || !res) {
          return '编码已存在';
        }
        return true;
      } catch (err) {
        return '编码重名校验失败，请稍后再试';
      }
    }
    return '编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
  }
  return true;
};

const checkName = async ({
  value, name, record, templateId, organizationId,
}: ValidatorProps) => {
  if (value && record && value !== record.getPristineValue(name)) {
    try {
      const res = await TemplateServices.checkNameOrCode({
        type: 'name', value, templateId, organizationId,
      });
      if ((res && res.failed) || !res) {
        return '名称已存在';
      }
      return true;
    } catch (err) {
      return '名称重名校验失败，请稍后再试';
    }
  }
  return true;
};

const mapping = {
  templateName: {
    name: 'name',
    type: 'string',
    label: '模板名称',
    required: true,
    maxLength: 40,
  },
  templateCode: {
    name: 'code',
    type: 'string',
    label: '模板编码',
    required: true,
    maxLength: 30,
  },
  createWay: {
    name: 'createType',
    type: 'string',
    label: '创建方式',
    textField: 'text',
    valueField: 'value',
    defaultValue: 'template',
    options: new DataSet({
      data: [{
        value: 'template',
        text: '基于已有模板创建',
      }, {
        value: 'gitlab',
        text: '从GitLab导入模板',
      }, {
        value: 'github',
        text: '从Github导入模板',
      }],
    }),
    required: true,
  },
  appTemplate: {
    name: 'selectedTemplateId',
    type: 'string',
    label: '应用模板',
    textField: 'name',
    valueField: 'id',
  },
  gitlabAddress: {
    name: 'gitlab',
    type: 'string',
    label: 'GitLab地址',
  },
  token: {
    name: 'token',
    type: 'string',
    label: '私有Token',
  },
  githubAddress: {
    name: 'github',
    type: 'string',
    label: 'GitHub地址',
  },
};

export { mapping };

export default ({ templateId, templateOptionsDs, organizationId }: FormProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  autoQueryAfterSubmit: false,
  transport: {
    read: {
      url: TemplateApis.getTemplateDetail(templateId),
      method: 'get',
    },
    create: ({ data: [data] }) => {
      const postData = { ...data };
      if (data[mapping.createWay.name] === 'template') {
        postData.repoUrl = null;
      } else {
        postData.repoUrl = data[data[mapping.createWay.name]];
        postData[mapping.appTemplate.name] = null;
      }
      return ({
        url: TemplateApis.createTemplate(),
        method: 'post',
        data: postData,
      });
    },
    update: ({ data: [data] }) => ({
      url: TemplateApis.updateTemplateName(data.id, data.name, organizationId),
      method: 'get',
    }),
  },
  fields: Object.keys(mapping).map((key) => {
    // @ts-ignore
    const item = mapping[key];
    switch (key) {
      case 'createWay':
        item.required = !templateId;
        break;
      // 应用模板
      case 'appTemplate':
        item.dynamicProps = {
          required: ({ record }: RecordObjectProps) => record.get(mapping.createWay.name) === 'template',
        };
        item.options = templateOptionsDs;
        break;
      //  gitlab地址
      case 'gitlabAddress':
        item.dynamicProps = {
          required: ({ record }: RecordObjectProps) => record.get(mapping.createWay.name) === 'gitlab',
        };
        break;
      //  私有Token
      case 'token':
        item.dynamicProps = {
          required: ({ record }: RecordObjectProps) => record.get(mapping.createWay.name) === 'gitlab',
        };
        break;
      case 'githubAddress':
        item.dynamicProps = {
          required: ({ record }: RecordObjectProps) => record.get(mapping.createWay.name) === 'github',
        };
        break;
      case 'templateName':
        item.validator = (value: string, name: string, record: Record) => (
          checkName({
            value, name, record, templateId, organizationId,
          })
        );
        break;
      case 'templateCode':
        item.validator = (value: string) => (
          codeValidator({
            value, organizationId, templateId,
          })
        );
        break;
      default:
        break;
    }
    return item;
  }),
});
