import React, { useState, useEffect } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Choerodon } from '@choerodon/boot';
import {
  text1, text2, text3,
} from './Constant';
import { pipeLineApi } from '@/api/pipeLine';

import './index.less';

export default function GitlabRunner() {
  useEffect(() => {
    pipeLineApi.getParams().then((res) => {
      console.log(res);
      setParamsObj(res);
    });
  }, []);
  const [paramsObj, setParamsObj] = useState({});

  const prefixCls = 'c7ncd-pipelineManage-runner';
  const options = {
    format: 'text/plain',
  };

  const handleCopy = () => {
    Choerodon.prompt('复制成功');
  };

  return (
    <div className={`${prefixCls}`}>
      <p>
        Gitlab CI 是 Gitlab 集成的开源持续集成服务，Gitlab Runner 是 GitLab CI
        的实现工具。 我们使用 Gitlab CI
        进行自动化构建制品、代码测试以及将结果发回给 Choerodon猪齿鱼等任务。
        Gitlab Runner 安装方式有很多种，本文以 kubernetes
        安装方式进行讲解，若使用其他方式，请参考 Gitlab 官网
      </p>
      <h3>前置要求</h3>
      <p>1.Container Runtime 采用 docker 的 kubernetes 集群</p>
      <p>2.已安装 helm 命令行并能访问 kubernetes 集群</p>
      <p>3.已安装 NFS Provisioner 或有其他动态存储</p>
      <h3>安装流程</h3>
      <p>第一步：获取 Gitlab Runner 注册 Token</p>
      <p>
        点击
        <a href={paramsObj['gitlab-group-url']}>这里</a>
        进入项目对应的 Gitlab Group 设置页面，选择 Settings
        {' '}
        {'>'}
        {' '}
        CI/CD
        并展开菜单
      </p>
      <div className="image-1" />
      <p>此时我们获取到了 Gitlab 的访问地址以及 Gitlab Runner 的注册 Token。</p>
      <p>第二步：添加 choerodon chart 仓库</p>
      <pre className="code">
        {text1}
        <CopyToClipboard text={text1} onCopy={handleCopy} options={options}>
          <Icon type="library_books" className="copy-button" />
        </CopyToClipboard>
      </pre>
      <p>第三步：创建存储卷</p>
      <p>
        创建存储卷是为了存放在进行 Gitlab CI 时所产生的制品或缓存的依赖包，
        从而可以使用上一阶段所产生的制品或加速构建。
      </p>
      <p>创建 maven 依赖存储卷</p>
      <pre className="code">
        {text2}
        <CopyToClipboard text={text2} onCopy={handleCopy} options={options}>
          <Icon type="library_books" className="copy-button" />
        </CopyToClipboard>
      </pre>

      <p>创建其他缓存存储卷</p>
      <pre className="code">
        {text3}
        <CopyToClipboard text={text3} onCopy={handleCopy} options={options}>
          <Icon type="library_books" className="copy-button" />
        </CopyToClipboard>
      </pre>

      <div className="gitlab-runner-table">
        <table border="1">
          <tr>
            <td>参数</td>
            <td>含义</td>
          </tr>
          <tr>
            <td>accessModes</td>
            <td>存储卷访问模式（请勿更改）</td>
          </tr>
          <tr>
            <td>requests.storage</td>
            <td>申请存储卷空间大小</td>
          </tr>
          <tr>
            <td>storageClassName</td>
            <td>动态存储类名称</td>
          </tr>
        </table>
      </div>

      <p>第四步：安装 Gitlab Runner</p>
      <pre className="code">
        {`helm install c7n/gitlab-runner \\
--set rbac.create=true \\
--set env.concurrent=3 \\
--set env.gitlabUrl=${paramsObj['gitlab-url']} \\
--set env.runnerRegistrationToken=xwxobLNoPQUzyMt_4RGF \\
--set env.environment.CHOERODON_URL=${paramsObj['gitlab-group-url']} \\
--set env.persistence.runner-maven-pvc="/root/.m2" \\
--set env.persistence.runner-cache-pvc="/cache" \\
--set enabled_mount_host_docker_sock=true \\
--name runner \\
--version 0.2.4 \\
--namespace c7n-system`}
        <CopyToClipboard
          text={`helm install c7n/gitlab-runner \\
          --set rbac.create=true \\
          --set env.concurrent=3 \\
          --set env.gitlabUrl=http://gitlab.example.choerodon.io/ \\
          --set env.runnerRegistrationToken=xwxobLNoPQUzyMt_4RGF \\
          --set env.environment.CHOERODON_URL=http://api.example.choerodon.io \\
          --set env.persistence.runner-maven-pvc="/root/.m2" \\
          --set env.persistence.runner-cache-pvc="/cache" \\
          --set enabled_mount_host_docker_sock=true \\
          --name runner \\
          --version 0.2.4 \\
          --namespace c7n-system`}
          onCopy={handleCopy}
          options={options}
        >
          <Icon type="library_books" className="copy-button" />
        </CopyToClipboard>
      </pre>

      <div className="gitlab-runner-table">
        <table border="1">
          <tr>
            <td>参数</td>
            <td>含义</td>
          </tr>
          <tr>
            <td>rbac.create</td>
            <td>创建sa及授权</td>
          </tr>
          <tr>
            <td>env.concurrent</td>
            <td>可以同时进行的CI数量</td>
          </tr>
          <tr>
            <td>env.gitlabUrl</td>
            <td>Gitlab地址（第一步中已获取）</td>
          </tr>
          <tr>
            <td>env.runnerRegistrationToken</td>
            <td>Runner注册token （第一步中已获取）</td>
          </tr>
          <tr>
            <td>env.environment.*</td>
            <td>
              CI时Pod的环境变量键值对，*就是环境变量名，等号后面的为该变量的值，这里
              例子中添加这几个环境变量建议配置，使用Choerodon管理的项目进行CI时会用到它们，若还需其他环境变量请自定义。
            </td>
          </tr>
          <tr>
            <td>env.environment.CHOERODON_URL</td>
            <td>Choerodon API地址（无需更改）</td>
          </tr>
          <tr>
            <td>env.persistence.*</td>
            <td>
              CI时Pod的挂载PVC与Pod内目录的键值对，*就是PVC的名称，
              等号后面的值为要挂载到Pod的哪个目录，这里注意一点用引号引起来。
              本例中我们新建了两个PVC即
              <code>runner-maven-pvc</code>
              、
              <code>runner-cache-pvc</code>
              分别挂载到
              <code>/root/.m2</code>
              和
              <code>/cache</code>
              目录中。
            </td>
          </tr>
          <tr>
            <td>env.persistence.runner-maven-pvc</td>
            <td>
              持久化数据，此处的
              <code>runner-maven-pvc</code>
              为PVC名称,值要挂载到Pod的
              <code>/root/.m2</code>
              目录
            </td>
          </tr>
          <tr>
            <td>env.persistence.runner-cache-pvc</td>
            <td>
              持久化数据，此处
              <code>runner-cache-pvc</code>
              为PVC名称，值为要挂载到Pod的
              <code>/cache目录</code>
            </td>
          </tr>
          <tr>
            <td>enabled_mount_host_docker_sock</td>
            <td>
              是否将
              <code>dockers.sock</code>
              节点文件挂在到Pod中，以便build docker镜像
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
}
