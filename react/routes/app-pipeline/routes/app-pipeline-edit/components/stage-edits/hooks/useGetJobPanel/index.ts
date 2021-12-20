import { useQueryClient } from 'react-query';

const useGetJobPanel = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<any[]>('job-panel');
};

export default useGetJobPanel;
