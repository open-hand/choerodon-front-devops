import React, { useMemo, useState } from 'react';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

const JmeterGuide: React.FC<any> = (): any => {
  const prefixCls = 'c7ncd-host-jmeter-guide';
  const text = useMemo(() => ('nohup ./jmeter-server \\\n'
    + '-Djava.rmi.server.hostname=${你的主机ip地址} \\\n'
    + '-Dserver.rmi.ssl.disable=true \\\n'
    + '-Dserver.rmi.port=1099 \\\n'
    + '-Dserver.rmi.localport=1099 \\\n'
    + '-Dserver_port=1099 &'), []);
  const [isExpand, setExpand] = useState(false);

  const handleExpand = () => {
    setExpand((pre) => !pre);
  };
  return (
    <div className={`${prefixCls}`}>
      <div className={`${prefixCls}-header`}>
        <span>测试主机-Jmeter配置指引</span>
        <Icon
          type={isExpand ? 'expand_less' : 'expand_more'}
          className={`${prefixCls}-header-expand`}
          onClick={handleExpand}
        />
      </div>
      <div className={`${prefixCls}-content${isExpand ? '' : '-close'}`}>
        <span className={`${prefixCls}-content-item`}>
          1. 操作主机, 配置java8环境, 配置完成后, 执行
          <br />
          <span className="c7ncd-host-jmeter-guide-content-tag">java -version</span>
          指令, 能看到正常的java版本表示配置正常；
        </span>
        <span className={`${prefixCls}-content-item`}>
          2. 安装Jmeter；进入官网页面https://jmeter.apache.org/download_jmeter.cgi, 下载5.3版本的jmeter；
        </span>
        <span className={`${prefixCls}-content-item`}>
          3. 将jmeter的压缩包解压到合适的目录, 进入解压后的目录, 这个目录称为:
          <span className="c7ncd-host-jmeter-guide-content-tag">JMETER_HOME</span>
        </span>
        <span className={`${prefixCls}-content-item`}>
          4. 执行
          <span className="c7ncd-host-jmeter-guide-content-tag">mkdir /choerodon && chmod 777 -R /choerodon</span>
          指令在根目录创建
          <span className="c7ncd-host-jmeter-guide-content-tag">choerodon</span>
          目录, 这个目录用于执行压力测试时放置相关的文件
        </span>
        <span className={`${prefixCls}-content-item`}>
          5. 进入
          <span className="c7ncd-host-jmeter-guide-content-tag">$JMETER_HOME/bin</span>
          目录
        </span>
        <span className={`${prefixCls}-content-item`}>
          6. 执行以下命令(注意变量替换):
          <span className={`${prefixCls}-content-item-text`}>
            {text}
          </span>
        </span>
        <span className={`${prefixCls}-content-failed`}>
          注意：
          <br />
          1. 此处的主机ip地址需和Choerodon猪齿鱼界面中维护的节点IP保持一致。
          <br />
          2. 准备作为控制机器的主机, 需要将防火墙关闭。
        </span>
      </div>
    </div>
  );
};

export default JmeterGuide;
