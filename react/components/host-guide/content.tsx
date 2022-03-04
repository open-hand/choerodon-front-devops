import React from 'react';
import { YamlEditor } from '@choerodon/components';

import './index.less';

const prefix = 'c7ncd-hostGuide';

const data = [{
  name: 'Golang',
  prepare: [
    '1. 部署前需确保主机上已经准备好Golang运行环境。',
    '2. 您需要在目标主机上生成id_rsa.pub，并且在主机上进行配置。',
    '3. 修改/etc/ssh/ssh_config，添加 StrictHostKeyChecking no 属性。',
  ],
  pre: `#前置操作用来做一些启动应用之前的操作，比如下载应用、编译应用、备份应用数据信息等等
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE；
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）
rm -rf host-golang #清理主机中已有的同名目录
git clone http://ssh://git@code.example.com/host-golang.git #从代码仓库中克隆代码。
cd host-golang
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build  -o golang-demo . #执行Go构建指令，生成制品。
mv golang-demo ../
chmod +x \${WORK_DIR}/golang-demo`,
  start: `# 启动应用命令
# 注意，启动命令如果不自动挂到后台执行，那么应该使用nohup & 将应用挂到后台，
# 否则执行该命令的shell将一直挂起，直到超时
nohup ./golang-demo & #在主机中启动go应用。`,
  delete: `# 该命令用来杀掉应用，在修改应用或者删掉应用时会调用
PID=$(ps -ef |grep "golang-demo" |grep -v 'grep'|awk '{print $2}')
if [ $PID ]; then
  kill -9 $PID
fi`,
  probe: `#可读健康探针根据命令的执行后退出状态码进行判断，只有命令执行后的退出码为0才认为探针执行成功
curl -s --fail localhost:9090`,
}, {
  name: 'Python',
  prepare: [
    '1. 部署前需确保主机上已经准备好Python运行环境。',
    '2. 您需要在目标主机上生成id_rsa.pub，并且在GitLab中进行配置。',
    '3. 修改/etc/ssh/ssh_config，添加 StrictHostKeyChecking no 属性。',
  ],
  pre: `#前置操作用来做一些启动应用之前的操作，比如下载应用、编译应用、备份应用数据信息等等
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE；
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）
rm -rf host-python  #清理主机中同名目录
git clone http://ssh://git@code.example.com/host-python.git #从代码仓库中克隆代码。
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple #设置python的镜像代理
pip install -r requirements.txt #安装python应用需要的依赖`,
  start: `# 启动应用命令
# 注意，启动命令如果不自动挂到后台执行，那么应该使用nohup & 将应用挂到后台，
# 否则执行该命令的shell将一直挂起，直到超时
nohup python app.py & # 启动python应用`,
  delete: `# 该命令用来杀掉应用，在修改应用或者删掉应用时会调用
PID=$(ps -ef |grep "app.py" |grep -v 'grep'|awk '{print $2}')
if [ $PID ]; then
  kill -9 $PID
fi`,
  probe: `#可读健康探针根据命令的执行后退出状态码进行判断，只有命令执行后的退出码为0才认为探针执行成功
curl -s --fail localhost`,
}, {
  name: 'C/C++',
  prepare: [
    '1. 部署前需确保主机上已经准备好C/C++的运行环境。',
    '2. 您需要在目标主机上生成id_rsa.pub，并且在GitLab中进行配置。',
    '3. 修改/etc/ssh/ssh_config，添加 StrictHostKeyChecking no 属性。',
  ],
  pre: `#前置操作用来做一些启动应用之前的操作，比如下载应用、编译应用、备份应用数据信息等等
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE；
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）
rm -rf host-cpp  #清理主机中同名目录
git clone http://ssh://git@code.example.com/host-cpp.git #从代码仓库中克隆代码。
mkdir build  && cd build # 创建编译目录
conan install .. # 编译项目
cmake .. -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release 
cmake --build .`,
  start: `# 启动应用命令
# 注意，启动命令如果不自动挂到后台执行，那么应该使用nohup & 将应用挂到后台，
# 否则执行该命令的shell将一直挂起，直到超时
nohup ./host-cpp/build/bin/hello &`,
  delete: `# 该命令用来杀掉应用，在修改应用或者删掉应用时会调用
PID=$(ps -ef |grep "./host-cpp/build/bin/hello" |grep -v 'grep'|awk '{print $2}')
if [ $PID ]; then
 kill -9 $PID
fi`,
  probe: `#可读健康探针根据命令的执行后退出状态码进行判断，只有命令执行后的退出码为0才认为探针执行成功
curl -s --fail localhost:8080`,
}, {
  name: 'Node.JS',
  prepare: [
    '1. 部署前需确保主机上已经准备好Node.js运行环境。',
    '2. 您需要在目标主机上生成id_rsa.pub，并且在GitLab中进行配置。',
    '3. 修改/etc/ssh/ssh_config，添加 StrictHostKeyChecking no 属性。',
  ],
  pre: `#前置操作用来做一些启动应用之前的操作，比如下载应用、编译应用、备份应用数据信息等等
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE；
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）
rm -rf host-node-js
git clone http://ssh://git@code.example.com/host-node-js.git #从代码仓库中克隆代码。
cd host-node-js # 切换到克隆的代码仓库目录下
npm install # 安装依赖
chmod -R 755 node_modules # 修改目录权限，避免构建应用的时候没有权限写
npm run build # 构建
rm -rf /usr/share/nginx/html # 移除nginx指定工作目录下的旧应用
mkdir -p /usr/share/nginx/html 
cd build
mv * /usr/share/nginx/html/ # 将新构建的应用拷贝到nginx指定工作目录下`,
  delete: `# 该命令用来杀掉应用，在修改应用或者删掉应用时会调用
nginxProcess="nginx: worker process"
if [ -n "$nginxProcess" ];then
        echo "nginx is running.stop it now..."
        nginx -s stop
else
        echo "nginx not running.exit."
fi`,
  probe: `#可读健康探针根据命令的执行后退出状态码进行判断，只有命令执行后的退出码为0才认为探针执行成功
curl -s --fail localhost:8080`,
  post: `#在启动命令之后执行
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE、。
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#启动PHP服务：php-fpm -c /usr/local/php/etc/php.ini -y /usr/local/php/etc/php-fpm.conf
#重启PHP服务（ps -ef | grep 'php-fpm'|awk '{print $2}'|kill -USR2）
#./server.startup -tomcat
/usr/local/nginx/sbin/nginx`,
}, {
  name: 'PHP',
  prepare: [
    '1. 部署前需确保主机上已经准备好PHP运行环境。',
    '2. 您需要在目标主机上生成id_rsa.pub，并且在GitLab中进行配置。',
    '3. 修改/etc/ssh/ssh_config，添加 StrictHostKeyChecking no 属性。',
  ],
  pre: `#前置操作用来做一些启动应用之前的操作，比如下载应用、编译应用、备份应用数据信息等等
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE；
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）
rm -rf host-php  #清理主机中同名目录
git clone http://ssh://git@code.example.com/host-php.git #从代码仓库中克隆代码。
cd host-php
cp index.php /var/www/html # 将php脚本移动到apache配置的目录中`,
  start: `# 启动应用命令
# 注意，启动命令如果不自动挂到后台执行，那么应该使用nohup & 将应用挂到后台，
# 否则执行该命令的shell将一直挂起，直到超时
nohup apache2-foreground & # 启动apache服务`,
  delete: `# 该命令用来杀掉应用，在修改应用或者删掉应用时会调用
PID=$(ps -ef |grep "apache2 -DFOREGROUND"|grep 'root'|grep -v 'grep'|awk '{print $2}')
if [ $PID ]; then
  kill -15 $PID
fi`,
  probe: `#可读健康探针根据命令的执行后退出状态码进行判断，只有命令执行后的退出码为0才认为探针执行成功
curl -s --fail localhost`,
}, {
  name: '.Net Core',
  prepare: [
    '1. 部署前需确保主机上已经准备好.NET Core运行环境。',
    '2. 您需要在目标主机上生成id_rsa.pub，并且在GitLab中进行配置。',
    '3. 修改/etc/ssh/ssh_config，添加 StrictHostKeyChecking no 属性。',
  ],
  pre: `#前置操作用来做一些启动应用之前的操作，比如下载应用、编译应用、备份应用数据信息等等
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE；
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#默认在\${WORK_DIR}目录下执行命令，若想切换到其它目录，可通过cd切换
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）
rm-rf host-net-core  #清理主机中同名目录
git clone http://ssh://git@code.example.com/host-net-core.git #从代码仓库中克隆代码。cd host-net-core
dotnet  restore # 编译net项目
dotnet publish -c release -o \${WORK_DIR} --no-restore`,
  start: `# 启动应用命令
# 注意，启动命令如果不自动挂到后台执行，那么应该使用nohup & 将应用挂到后台，
# 否则执行该命令的shell将一直挂起，直到超时
nohup dotnet aspnetapp.dll & # 后台执行dotnet应用`,
  delete: `# 该命令用来杀掉应用，在修改应用或者删掉应用时会调用
PID=$(ps -ef |grep "dotnet aspnetapp.dll" |grep -v 'grep'|awk '{print $2}')
if [ $PID ]; then
  kill -9 $PID
fi`,
  probe: `#可读健康探针根据命令的执行后退出状态码进行判断，只有命令执行后的退出码为0才认为探针执行成功
curl -s --fail localhost:5000`,
}];

const Index = () => (
  <div className={prefix}>
    {
      data.map((i, index) => (
        <>
          {
            index !== 0 && (
              <div className={`${prefix}-divided`} />
            )
          }
          <p className={`${prefix}-title`}>
            {i.name}
          </p>
          <p className={`${prefix}-phrase`}>
            环境准备相关事项
          </p>
          {i.prepare.map((p) => (
            <p className={`${prefix}-phrase`}>
              {p}
            </p>
          ))}
          {
            i?.pre && (
              <>
                <div className={`${prefix}-divided`} />
                <p className={`${prefix}-title`}>
                  前置操作
                </p>
                <YamlEditor
                  modeChange={false}
                  readOnly
                  showError={false}
                  value={i.pre}
                />
              </>
            )
          }
          {
            i?.start && (
              <>
                <div className={`${prefix}-divided`} />
                <p className={`${prefix}-title`}>
                  启动命令
                </p>
                <YamlEditor
                  modeChange={false}
                  readOnly
                  showError={false}
                  value={i.start}
                />
              </>
            )
          }
          {
            i?.delete && (
              <>
                <div className={`${prefix}-divided`} />
                <p className={`${prefix}-title`}>
                  删除命令
                </p>
                <YamlEditor
                  modeChange={false}
                  readOnly
                  showError={false}
                  value={i.delete}
                />
              </>
            )
          }
          {
            i?.probe && (
              <>
                <div className={`${prefix}-divided`} />
                <p className={`${prefix}-title`}>
                  Readiness Probe
                </p>
                <YamlEditor
                  modeChange={false}
                  readOnly
                  showError={false}
                  value={i.probe}
                />
              </>
            )
          }
          {
            i?.post && (
              <>
                <div className={`${prefix}-divided`} />
                <p className={`${prefix}-title`}>
                  后置操作
                </p>
                <YamlEditor
                  modeChange={false}
                  readOnly
                  showError={false}
                  value={i.post}
                />
              </>
            )
          }
        </>
      ))
    }
  </div>
);

export default Index;
