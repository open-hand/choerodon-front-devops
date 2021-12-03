/* eslint-disable import/no-anonymous-default-export */
import { appServiceApiConfig } from '@choerodon/master';
import getTablePostData from '@/utils/getTablePostData';

export default ():any => ({
  selection: 'single',
  pageSize: 5,
  paging: true,
  transport: {
    read({ data }:any) {
      const postData = getTablePostData(data);
      return appServiceApiConfig.getBrachs(data.appServiceId, postData);
    },
  },
  autoQuery: false,
});
