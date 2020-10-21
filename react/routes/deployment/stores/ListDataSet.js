import getTablePostData from '../../../utils/getTablePostData';

const mapping = {
  deployMethod: {
    value: 'deployMethod',
  },
  deployObject: {
    value: 'deployObject',
  },
};

export { mapping };

export default ((
  intlPrefix,
  formatMessage,
  projectId,
  envOptions,
  deployTypeDs,
  deployResultDs,
  pipelineOptions,
  deployModeDs,
) => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: ({ data }) => {
      const postData = {
        param: [],
        searchParam: {
          ...data,
          env: data.env ? String(data.env) : null,
        },
      };
      return ({
        url: `/devops/v1/projects/${projectId}/deploy_record/paging`,
        method: 'get',
      });
    },
  },
  fields: [
    { name: 'deployId', type: 'string', label: formatMessage({ id: `${intlPrefix}.number` }) },
    { name: mapping.deployMethod.value, type: 'string', label: '部署方式&载体' },
    { name: mapping.deployObject.value, type: 'string', label: '部署对象' },
    { name: 'deployType', type: 'string', label: formatMessage({ id: `${intlPrefix}.type` }) },
    { name: 'envName', type: 'string', label: formatMessage({ id: `${intlPrefix}.env` }) },
    { name: 'deployTime', type: 'dateTime', label: formatMessage({ id: `${intlPrefix}.time` }) },
    { name: 'deployStatus', type: 'string', label: '执行结果' },
    { name: 'pipelineTriggerType', type: 'string', label: formatMessage({ id: `${intlPrefix}.pipeline.type` }) },
    { name: 'deployCreatedBy', type: 'string' },
    { name: 'pipelineName', type: 'string', label: formatMessage({ id: `${intlPrefix}.pipeline.name` }) },
    { name: 'executeUser', label: '执行' },
    { name: 'instanceName', type: 'string', label: formatMessage({ id: `${intlPrefix}.instance` }) },
    { name: 'appServiceName', type: 'string', label: formatMessage({ id: 'appService' }) },
    { name: 'userImage', type: 'string' },
    { name: 'realName', type: 'string' },
  ],
  queryFields: [
    {
      name: 'deploy_type', type: 'string', textField: 'text', valueField: 'value', label: formatMessage({ id: `${intlPrefix}.type` }), options: deployTypeDs,
    },
    {
      name: 'deploy_mode', type: 'string', textField: 'text', valueField: 'value', label: '部署方式', options: deployModeDs,
    },
    {
      name: 'deploy_payload_name', type: 'string', label: '部署载体名称',
    },
    {
      name: 'deploy_result', type: 'string', textField: 'text', valueField: 'value', label: '执行结果', options: deployResultDs,
    },
    {
      name: 'deploy_object_name', type: 'string', label: '部署对象名称',
    },
    {
      name: 'deploy_object_version', type: 'string', label: '部署版本',
    },
  ],
}));
