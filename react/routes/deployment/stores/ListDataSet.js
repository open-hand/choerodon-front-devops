import getTablePostData from '../../../utils/getTablePostData';

const mapping = {
  deployMethod: {
    value: 'deployMethod',
  },
};

export default ((
  intlPrefix, formatMessage, projectId, envOptions, deployTypeDs, deployResultDs, pipelineOptions,
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
    { name: 'deployType', type: 'string', label: formatMessage({ id: `${intlPrefix}.type` }) },
    { name: 'envName', type: 'string', label: formatMessage({ id: `${intlPrefix}.env` }) },
    { name: 'deployTime', type: 'dateTime', label: formatMessage({ id: `${intlPrefix}.time` }) },
    { name: 'deployStatus', type: 'string', label: formatMessage({ id: `${intlPrefix}.result` }) },
    { name: 'pipelineTriggerType', type: 'string', label: formatMessage({ id: `${intlPrefix}.pipeline.type` }) },
    { name: 'deployCreatedBy', type: 'string' },
    { name: 'pipelineName', type: 'string', label: formatMessage({ id: `${intlPrefix}.pipeline.name` }) },
    { name: 'executeUser', label: formatMessage({ id: 'executor' }) },
    { name: 'instanceName', type: 'string', label: formatMessage({ id: `${intlPrefix}.instance` }) },
    { name: 'appServiceName', type: 'string', label: formatMessage({ id: 'appService' }) },
    { name: 'userImage', type: 'string' },
    { name: 'realName', type: 'string' },
  ],
  queryFields: [
    {
      name: 'env_name', type: 'string', label: formatMessage({ id: `${intlPrefix}.env` }),
    },
    {
      name: 'app_service_name', type: 'string', label: formatMessage({ id: 'appService' }),
    },
    {
      name: 'deploy_type', type: 'string', textField: 'text', valueField: 'value', label: formatMessage({ id: `${intlPrefix}.type` }), options: deployTypeDs,
    },
    {
      name: 'deploy_result', type: 'string', textField: 'text', valueField: 'value', label: formatMessage({ id: `${intlPrefix}.result` }), options: deployResultDs,
    },
  ],
}));
