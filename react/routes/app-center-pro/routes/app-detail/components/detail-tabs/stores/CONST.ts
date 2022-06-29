const APP_EVENT = 'application_event';

const POD_DETAILS = 'pod_details';

const RUNNING_DETAILS = 'running_details';

const RESOURCE = 'resource';

const HOST_RUNNING_DETAILS = 'host_running_details';

const PROFILE_DETAILS = 'profile_details';
const APPMONITOR = 'app_monitoring';

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
    name: '网络配置',
  },
  // {
  //   key: APPMONITOR,
  //   name: '应用监控',
  // },
];

const hostKeys = [
  {
    key: HOST_RUNNING_DETAILS,
    name: '运行详情',
  },
  //   {
  //     key: PROFILE_DETAILS,
  //     name: '配置文件详情',
  //   },
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
  PROFILE_DETAILS,
  APPMONITOR,
};
