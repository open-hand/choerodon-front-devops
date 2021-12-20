import { pipelinTemplateApiConfig } from '@/api/pipeline-template';

const PipeineTemplatesDs = () => ({
  autoQuery: true,
  paging: false,
  transport: {
    read: () => pipelinTemplateApiConfig.getPipelineTemplate(),
  },
});

export default PipeineTemplatesDs;
