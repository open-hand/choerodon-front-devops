import { has, get } from '@choerodon/inject';

const deployReportList = [
  {
    key: 'deploy-times',
    link: '/devops/reports/deploy-times',
    pic: 'number',
    title: '部署次数图',
  }, {
    key: 'deploy-duration',
    link: '/devops/reports/deploy-duration',
    pic: 'deploy-duration',
    title: '部署时长图',
  },
];

const developReportList = [
  {
    key: 'submission',
    link: '/devops/reports/submission',
    pic: 'submission',
    title: '代码提交图',
  }, {
    key: 'build-number',
    link: '/devops/reports/build-number',
    pic: 'number',
    title: '构建次数图',
  }, {
    key: 'build-duration',
    link: '/devops/reports/build-duration',
    pic: 'build-duration',
    title: '构建时长图',
  }, {
    key: 'pipelineTrigger-number',
    link: '/devops/reports/pipelineTrigger-number',
    pic: 'pipelineTrigger-number',
    title: '流水线触发次数图',
  }, {
    key: 'pipeline-duration',
    link: '/devops/reports/pipeline-duration',
    pic: 'pipeline-duration',
    title: '流水线执行时长图',
  },
];

has('rdqam:reportList') && developReportList.splice(1, 0, ...get('rdqam:reportList'));

const reportListMap = {
  deploy: deployReportList,
  develop: developReportList,
};

export {
  deployReportList,
  developReportList,
  reportListMap,
};
