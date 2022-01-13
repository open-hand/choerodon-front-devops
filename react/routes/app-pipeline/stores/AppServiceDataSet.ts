import { appServiceApiConfig } from '@choerodon/master';
import getTablePostData from '@/utils/getTablePostData';

const PipelineBasicInfoDataSet = ():any => ({
  autoQuery: true,
  selection: 'single',
  pageSize: 20,
  transport: {
    read({ data }:any) {
      const postData = getTablePostData(data);
      postData.searchParam.name = postData.searchParam?.key;
      postData.searchParam?.key && delete postData.searchParam?.key;
      return appServiceApiConfig.getAppListsService(postData);
    },
  },
});

export default PipelineBasicInfoDataSet;
