import { appServiceApiConfig } from '@choerodon/master';

export default () => ({
  selection: 'single',
  pageSize: 5,
  paging: true,
  transport: {
    read({ data }) {
      const { key } = data;
      const res = { searchParam: { branchName: key } };
      return appServiceApiConfig.getBrachs(data.appServiceId, res);
    },
  },
  autoQuery: false,
});
