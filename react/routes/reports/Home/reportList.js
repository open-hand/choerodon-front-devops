import { has } from '@choerodon/inject';

const deployReportList = [
  {
    key: 'deploy-times',
    link: '/devops/charts/deploy/deploy-times',
    pic: 'number',
    title: '部署次数图',
  }, {
    key: 'deploy-duration',
    link: '/devops/charts/deploy/deploy-duration',
    pic: 'deploy-duration',
    title: '部署时长图',
  },
];

const qualityList = [
  {
    key: 'table-design-workplace',
    link: '/devops/charts/develop/design-quality-workplace',
    title: '表设计工作台',
  }, {
    key: 'code-quality-workplace',
    link: '/devops/charts/develop/code-quality-workplace',
    title: '代码质量工作台',
  },
];

const developReportList = [
  {
    key: 'submission',
    link: '/devops/charts/develop/submission',
    pic: 'submission',
    title: '代码提交图',
  }, {
    key: 'build-number',
    link: '/devops/charts/develop/build-number',
    pic: 'number',
    title: '构建次数图',
  }, {
    key: 'build-duration',
    link: '/devops/charts/develop/build-duration',
    pic: 'build-duration',
    title: '构建时长图',
  }, {
    key: 'pipelineTrigger-number',
    link: '/devops/charts/develop/pipelineTrigger-number',
    pic: 'pipelineTrigger-number',
    title: '流水线触发次数图',
  }, {
    key: 'pipeline-duration',
    link: '/devops/charts/develop/pipeline-duration',
    pic: 'pipeline-duration',
    title: '流水线执行时长图',
  },
];

has('rdqam:tableDesignWorkplace') && developReportList.splice(1, 0, ...qualityList);

const reportListMap = {
  deploy: deployReportList,
  develop: developReportList,
};

export {
  deployReportList,
  developReportList,
  reportListMap,
};
