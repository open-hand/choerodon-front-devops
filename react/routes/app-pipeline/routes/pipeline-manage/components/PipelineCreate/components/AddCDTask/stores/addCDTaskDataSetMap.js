import { DataSet } from 'choerodon-ui/pro';

const relativeObjData = [{
  name: 'API测试任务',
  value: 'task',
}, {
  name: 'API测试套件',
  value: 'suite',
}];

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

const typeData = [{
  value: 'cdDeploy',
  name: '容器部署-Chart包',
}, {
  value: 'cdDeployment',
  name: '容器部署-部署组',
}];

const deployWayData = [{
  value: 'create',
  name: '新建应用',
}, {
  value: 'update',
  name: '更新应用',
}];

const productTypeData = [{
  value: 'jar',
  name: 'jar包',
}, {
  value: 'docker',
  name: 'Docker镜像',
}, {
  value: 'other',
  name: '其他制品',
}];

const fieldMap = {
  deployWay: {
    textField: 'name',
    valueField: 'value',
    defaultValue: deployWayData[0].value,
    name: 'deployType',
    type: 'string',
    label: '部署方式',
    options: new DataSet({
      data: deployWayData,
    }),
  },
  productType: {
    defaultValue: productTypeData[0].value,
    textField: 'name',
    valueField: 'value',
    name: 'hostDeployType',
    type: 'string',
    label: '制品类型',
    options: new DataSet({
      data: productTypeData,
    }),
  },
  preCommand: {
    name: 'preCommand',
    type: 'string',
    defaultValue: `
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE、。
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）`,
  },
  runCommand: {
    name: 'runCommand',
    type: 'string',
    defaultValue: `
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#启动jar应用：nohup java -jar \${APP_FILE} -D--spring.cloud.bootstrap.location=$WORK_DIR/application.yaml &
#启动golang应用：nohup ./c7n-agent &
#启动python应用：nohup python3 main.py &
#对PHP、war包这类应用的启动命令应该放到后置操作里面`,
  },
  postCommand: {
    name: 'postCommand',
    type: 'string',
    defaultValue: `
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE、。
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#启动PHP服务：php-fpm -c /usr/local/php/etc/php.ini -y /usr/local/php/etc/php-fpm.conf
#重启PHP服务（ps -ef | grep 'php-fpm'|awk '{print $2}'|kill -USR2）
#./server.startup -tomcat`,
  },
  dockerCommand: {
    name: 'dockerCommand',
    type: 'string',
    defaultValue: `
    # 通过docker部署镜像，预置环境变量：\${containerName} 容器名称 \${imageName} 镜像名称和tag。例如docker run -d --name=\${containerName} \${imageName}
    `,
  },
  killCommand: {
    name: 'killCommand',
    type: 'string',
    defaultValue: `
#删除命令： 
#例如：
#PID=$(ps -ef |grep "app.jar" |grep -v 'grep'|awk '{print $2}')
#if [ $PID ]; then
#  kill -9 $PID
#fi
    `,
  },
  healthProb: {
    name: 'healthProb',
    type: 'string',
    defaultValue: `
#可读健康探针根据命令的执行后退出状态码进行判断，只有状态码为0才认为探针执行成功
#例如 nc -z localhost 8070 && curl -s --fail localhost:8071/actuator/health
    `,
  },
  relativeObj: {
    name: 'taskType',
    type: 'string',
    label: '关联对象',
    defaultValue: relativeObjData[0].value,
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: relativeObjData,
    }),
  },
  kits: {
    name: 'apiTestSuiteId',
    type: 'string',
    label: 'API测试套件',
    textField: 'name',
    valueField: 'id',
    dynamicProps: {
      required: ({ record }) => record?.get('type') === map.apiTest
      && record?.get(fieldMap.relativeObj.name) === relativeObjData[1].value,
    },
  },
};

export default map;

export {
  typeData,
  fieldMap,
  deployWayData,
  productTypeData,
  relativeObjData,
};
