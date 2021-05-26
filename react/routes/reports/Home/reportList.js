const deployReportList = [
  {
    key: 'deploy-times',
    link: '/devops/reports/deploy-times',
    pic: 'number',
  }, {
    key: 'deploy-duration',
    link: '/devops/reports/deploy-duration',
    pic: 'deploy-duration',
  },
];

const developReportList = [
  {
    key: 'submission',
    link: '/devops/reports/submission',
    pic: 'submission',
  }, {
    key: 'code-quality',
    link: '/devops/reports/code-quality',
    pic: 'code-quality',
  }, {
    key: 'build-number',
    link: '/devops/reports/build-number',
    pic: 'number',
  }, {
    key: 'build-duration',
    link: '/devops/reports/build-duration',
    pic: 'build-duration',
  }, {
    key: 'pipelineTrigger-number',
    link: '/devops/reports/pipelineTrigger-number',
    pic: 'pipelineTrigger-number',
  }, {
    key: 'pipeline-duration',
    link: '/devops/reports/pipeline-duration',
    pic: 'pipeline-duration',
  },
];

const reportListMap = {
  deploy: deployReportList,
  develop: developReportList,
};

export {
  deployReportList,
  developReportList,
  reportListMap,
};
