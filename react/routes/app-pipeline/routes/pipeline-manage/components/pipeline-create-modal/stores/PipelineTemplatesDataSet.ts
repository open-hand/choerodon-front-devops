import { pipelinTemplateApiConfig } from '@choerodon/master';
import { DEFAULT_TMP } from './CONSTANTS';

const PipeineTemplatesDs = () => ({
  autoQuery: true,
  paging: false,
  transport: {
    read: () => pipelinTemplateApiConfig.getPipelineTemplate(),
  },
});

export default PipeineTemplatesDs;
