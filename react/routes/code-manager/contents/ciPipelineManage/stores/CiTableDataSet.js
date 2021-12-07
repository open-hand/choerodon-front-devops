import React from 'react';
import Tips from '../../../../../components/new-tips';

export default ((formatMessage, format) => ({
  autoQuery: false,
  selection: false,
  transport: {
    read: {
      method: 'get',
    },
  },

  fields: [
    { name: 'status', type: 'string', label: formatMessage({ id: 'ciPipeline.status' }) },
    { name: 'pipelineId', type: 'string', label: <Tips title={format({ id: 'Pipeline' })} helpText={formatMessage({ id: 'ciPipeline.sign.tip' })} /> },
    { name: 'gitlabProjectId', type: 'string' },
    { name: 'commit', type: 'string', label: <Tips title={formatMessage({ id: 'ciPipeline.commit' })} helpText={formatMessage({ id: 'ciPipeline.commit.tip' })} /> },
    { name: 'stages', type: 'string', label: <Tips title={format({ id: 'Stage' })} helpText={formatMessage({ id: 'ciPipeline.jobs.tip' })} /> },
    { name: 'pipelineTime', type: 'string', label: format({ id: 'Duration' }) },
    { name: 'creationDate', type: 'string', label: format({ id: 'CreationTime' }) },
  ],
}));
