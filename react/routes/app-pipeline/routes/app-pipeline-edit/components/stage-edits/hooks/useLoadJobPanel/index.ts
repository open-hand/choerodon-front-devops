import { useQuery } from 'react-query';
import { jobsGroupApi } from '@/api/jobs-group';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

const useLoadJobPanel = () => {
  const {
    level,
    jobGroupsApi: JobGroupsPromise,
  } = usePipelineContext();

  const loadJobPanelData = () => {
    if (level === 'project') {
      return jobsGroupApi.getJobsGroups();
    }
    return JobGroupsPromise;
  };
  return useQuery('job-panel', loadJobPanelData);
};

export default useLoadJobPanel;
