import { useQuery } from 'react-query';
import { jobsGroupApi } from '@/api/jobs-group';

const useLoadJobPanel = () => {
  const loadJobPanelData = () => jobsGroupApi.getJobsGroups();
  return useQuery('job-panel', loadJobPanelData);
};

export default useLoadJobPanel;
