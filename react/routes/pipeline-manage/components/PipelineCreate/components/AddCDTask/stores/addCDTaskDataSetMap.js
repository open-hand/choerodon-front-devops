const map = {
  // 主机来源name
  hostSource: 'hostSource',
  // 已有主机
  alreadyhost: 'existHost',
  // 自定义主机
  customhost: 'customHost',
  // 主机
  host: 'hostId',
  // Api测试
  apiTest: 'cdApiTest',
  // api测试任务
  apiTestMission: 'apiTestTaskId',
  // 是否阻塞后续阶段与任务
  whetherBlock: 'blockAfterJob',
  // 关联部署任务
  relativeMission: 'deployJobName',
  triggersTasks: {
    name: 'checkEnvPermissionFlag',
    values: [true, false],
  },
};

export default map;
