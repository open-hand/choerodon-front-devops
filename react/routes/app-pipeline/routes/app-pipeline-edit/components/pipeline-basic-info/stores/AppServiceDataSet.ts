import { appServiceApiConfig } from '@choerodon/master';
import getTablePostData from '@/utils/getTablePostData';

const PipelineBasicInfoDataSet = ({
  formatPipelineEdit,
}:any):any => ({
  autoQuery: true,
  selection: 'single',
  pageSize: 20,
  transport: {
    read({ data }:any) {
      const postData = getTablePostData(data);
      return appServiceApiConfig.getAppListsService(postData);
    },
  },
});

export default PipelineBasicInfoDataSet;
