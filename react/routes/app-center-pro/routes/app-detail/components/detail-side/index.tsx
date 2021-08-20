import PodCircle from '@/components/pod-circle';
import React from 'react';
import { UserInfo, TimePopover, StatusTag } from '@choerodon/components';
import { useAppDetailsStore } from '../../stores';
import './index.less';

const DetailAside = () => {
  const {
    subfixCls,
  } = useAppDetailsStore();

  return (
    <div className={`${subfixCls}-aside`}>
      <header>
        <PodCircle
          // @ts-expect-error
          style={{
            width: 22,
            height: 22,
          }}
          dataSource={[{
            name: 'running',
            value: 20,
            stroke: '#0bc2a8',
          }, {
            name: 'unlink',
            value: 2,
            stroke: '#fbb100',
          }]}
        />
        <span className={`${subfixCls}-aside-name`}>demo应用</span>
      </header>
      <main>
        <h3>详情</h3>
        <div className={`${subfixCls}-aside-main-content`}>
          <div>
            <span>应用编码</span>
            <span>devops-app</span>
          </div>
          <div>
            <span>环境</span>
            <span>Staging环境</span>
          </div>
          <div>
            <span>部署方式</span>
            <span>容器部署</span>
          </div>
          <div>
            <span>部署对象</span>
            <span>部署组</span>
          </div>
          <div>
            <span>Chart来源</span>
            <div className={`${subfixCls}-aside-main-chart-source`}>
              <span>
                XXX应用服务
              </span>
              <span>
                (服务来源：项目服务
                服务编码：proj-1)
              </span>
            </div>
          </div>
          <div>
            <span>Chart版本</span>
            <StatusTag name="部署中" colorCode="pending" />
          </div>
          <div>
            <span>Jar包来源</span>
            <div className={`${subfixCls}-aside-main-chart-source`}>
              <span>
                项目制品库
              </span>
              <span>
                (服务来源：项目服务
                服务编码：proj-1)
              </span>
            </div>
          </div>
          <div>
            <span>Jar包版本</span>
            <span>1.0.0</span>
          </div>
          <div>
            <span>创建信息</span>
            <div className={`${subfixCls}-aside-main-userinfo`}>
              <UserInfo realName="wengkaimin" />
              <span>创建于</span>
              <TimePopover content="" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailAside;
