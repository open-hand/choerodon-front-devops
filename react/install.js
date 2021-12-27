import { set } from '@choerodon/inject';
import { handlePipelineModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/stage-edits/components/job-btn/components/job-types-panel';

set('devops:reportHeaderButtons', () => import('./routes/reports/Component/HeaderButtons'));

set('devops:AppPipeline', () => import('@/routes/app-pipeline'));

set('devops:handlePipelineModal', handlePipelineModal);
