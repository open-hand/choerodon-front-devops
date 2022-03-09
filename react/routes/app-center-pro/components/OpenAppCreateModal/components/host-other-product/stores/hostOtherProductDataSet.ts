import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps, FieldProps, FieldType } from '@/interface';
import { hostDataSetConfig } from '../../host-app-config/stores/hostAppConfigDataSet';

const mapping: {
  [key: string]: FieldProps,
} = {
  host: {
    name: 'hostId',
    type: 'string' as FieldType,
    label: '主机',
    required: false,
    textField: 'name',
    valueField: 'id',
  },
  fileName: {
    name: 'fileName',
    type: 'string' as FieldType,
  },
  uploadUrl: {
    name: 'uploadUrl',
    type: 'string' as FieldType,
  },
  value: {
    name: 'preCommand',
    type: 'string' as FieldType,
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
  startCommand: {
    name: 'runCommand',
    type: 'string' as FieldType,
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
    type: 'string' as FieldType,
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
  killCommand: {
    name: 'killCommand',
    type: 'string' as FieldType,
    defaultValue: `
    #删除命令： 
#比如：
#PID=$(ps -ef |grep "app.jar" |grep -v 'grep'|awk '{print $2}')
#if [ $PID ]; then
  #kill -9 $PID
#fi`,
  },
  healthProb: {
    name: 'healthProb',
    type: 'string' as FieldType,
    defaultValue: `
    #可读健康探针根据命令的执行后退出状态码进行判断，只有状态码为0才认为探针执行成功
#比如 nc -z localhost 8070 && curl -s --fail localhost:8071/actuator/health`,
  },
};

const hostOtherProductDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'host': {
        item.options = new DataSet(hostDataSetConfig());
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
});

export default hostOtherProductDataSet;

export { mapping };
