const APP_EVENT = 'application_event';

const POD_DETAILS = 'pod_details';

const RUNNING_DETAILS = 'running_details';

const RESOURCE = 'resource';

const HOST_RUNNING_DETAILS = 'host_running_details';

const deployGroupKeys = [
  {
    key: APP_EVENT,
    name: '应用事件',
  },
  {
    key: POD_DETAILS,
    name: 'Pod详情',
  },
  {
    key: RUNNING_DETAILS,
    name: '运行详情',
  },
];

const chartKeys = [
  ...deployGroupKeys,
  {
    key: RESOURCE,
    name: '资源配置',
  },
];

const hostKeys = [
  {
    key: HOST_RUNNING_DETAILS,
    name: '运行详情',
  },
];

export {
  hostKeys,
  chartKeys,
  deployGroupKeys,
  APP_EVENT,
  POD_DETAILS,
  RUNNING_DETAILS,
  RESOURCE,
  HOST_RUNNING_DETAILS,
};
