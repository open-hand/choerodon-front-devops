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
  format,
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
    { name: 'deployId', type: 'string', label: format({ id: 'Number' }) },
    { name: mapping.deployMethod.value, type: 'string', label: '部署方式&载体' },
    { name: mapping.deployObject.value, type: 'string', label: '部署对象' },
    { name: 'deployType', type: 'string', label: formatMessage({ id: `${intlPrefix}.type` }) },
    { name: 'envName', type: 'string', label: formatMessage({ id: `${intlPrefix}.env` }) },
    { name: 'deployTime', type: 'dateTime', label: formatMessage({ id: `${intlPrefix}.time` }) },
    { name: 'deployResult', type: 'string', label: '执行结果' },
    { name: 'pipelineTriggerType', type: 'string', label: formatMessage({ id: `${intlPrefix}.pipeline.type` }) },
    { name: 'deployCreatedBy', type: 'string' },
    { name: 'pipelineName', type: 'string', label: formatMessage({ id: `${intlPrefix}.pipeline.name` }) },
    { name: 'executeUser', label: format({ id: 'Execute' }) },
    { name: 'appName', type: 'string', label: format({ id: 'GeneratedApplication' }) },
    { name: 'appServiceName', type: 'string', label: formatMessage({ id: 'appService' }) },
    { name: 'userImage', type: 'string' },
    { name: 'realName', type: 'string' },
    { name: 'deploySourceVO', label: format({ id: 'Source' }) },
  ],
  queryFields: [
    {
      name: 'deploy_type', type: 'string', textField: 'text', valueField: 'value', label: format({ id: 'DeploymentType' }), options: deployTypeDs,
    },
    {
      name: 'deploy_mode', type: 'string', textField: 'text', valueField: 'value', label: format({ id: 'DeploymentWay' }), options: deployModeDs,
    },
    {
      name: 'deploy_payload_name', type: 'string', label: format({ id: 'DeploymentCarrierName' }),
    },
    {
      name: 'deploy_result', type: 'string', textField: 'text', valueField: 'value', label: format({ id: 'ExecutionResult' }), options: deployResultDs,
    },
    {
      name: 'deploy_object_name', type: 'string', label: format({ id: 'DeployedObject' }),
    },
    {
      name: 'deploy_object_version', type: 'string', label: format({ id: 'Version' }),
    },
  ],
}));
