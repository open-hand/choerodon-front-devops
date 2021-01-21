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
    values: [false, true],
  },
  // 外部卡点
  externalStuck: 'cdExternalApproval',
  // 流水线回调地址
  pipelineCallbackAddress: 'pipelineCallbackAddress',
  // 外部地址
  externalAddress: 'triggerUrl',
  // token
  externalToken: 'secretToken',
  // 任务描述
  missionDes: 'description',
  // 是否启用告警设置
  alarm: 'enableWarningSetting',
  // 执行阈值
  threshold: 'performThreshold',
  // 通知对象
  notifyObject: 'notifyUserIds',
  // 通知方式
  notifyWay: 'notifyWay',
};

export default map;
