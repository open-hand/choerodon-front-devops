/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro/lib';
import { get } from 'lodash';

export default ({ projectId, ReportsStore, mainStore }) => ({
  selection: 'single',
  autoQuery: true,
  paging: false,
  transport: {
    read: ({ dataSet }) => ({
      url: `devops/v1/projects/${projectId}/cicd_pipelines/devops/pipeline`,
      method: 'get',
    }),
  },
  events: {
    load: ({ dataSet }) => {
      const ps = [
        'choerodon.code.project.deploy.app-deployment.pipeline.ps.create',
      ];
      if (dataSet.length) {
        mainStore.setSelectedPipeline(get(dataSet.toData()[0], 'id'));
      } else {
        ReportsStore.judgeRole(ps);
      }
    },
  },
});
