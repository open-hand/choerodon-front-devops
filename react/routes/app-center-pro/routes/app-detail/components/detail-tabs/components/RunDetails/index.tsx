/* eslint-disable max-len */
import React, {
  useState, useEffect,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import _ from 'lodash';
import TimeAgo from 'timeago-react';
import { Choerodon } from '@choerodon/boot';
import {
  Tooltip, Button, Icon, Popover, Spin,
} from 'choerodon-ui';
import { formatDate } from '@/utils';
import Pods from './components/pods';
import DetailsSidebar from './components/sidebar';
import './index.less';
import { useAppDetailTabsStore } from '../../stores';
import { useAppDetailsStore } from '../../../../stores';
import TabEmptyPage from '../TabEmptyPage';

const Label = ({ name, value }:any) => (
  <Tooltip title={`键-${name} 值-${value}`}>
    <div className="c7ncd-deployment-popover-labels">
      <span>
        键-
        {name}
      </span>
      <span>
        值-
        {value}
      </span>
    </div>
  </Tooltip>
);

export default observer(() => {
  const [visible, setVisible] = useState(false);

  const {
    runDetailsStore,
    runDetailsStore: {
      getResources,
      getLoading,
      getTargetCount: targetCount,
    },
    intlPrefix,
    projectId,
    formatMessage,
    loadData,
  } = useAppDetailTabsStore();

  const {
    deployTypeId: envId,
    appId,
    appDs,
    appCatergory,
  } = useAppDetailsStore();

  useEffect(() => () => {
    runDetailsStore.setResources({});
  }, []);

  const changeTargetCount = (count:any) => {
    runDetailsStore.setTargetCount(count);
  };

  /**
   * 打开Deployment详情侧边栏，并加载数据
   * @param type
   * @param {*} id
   * @param {*} name
   */
  const handleClick = async (type:any, name:any, instanceId:string) => {
    // chart包的和部署组的接口不一样
    const groupType = appCatergory.code;
    const result = await runDetailsStore.loadDeploymentsJson(type, instanceId, name, groupType);
    runDetailsStore.loadDeploymentsYaml(type, instanceId, name, groupType);
    if (result) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const getDeployContent = (podType:any) => {
    let status:any;
    let connect:any;
    let instanceStatus:any;
    const record = appDs.current;
    if (record) {
      status = record.get('effectCommandStatus');
      connect = record.get('envConnected');
      instanceStatus = record.get('objectStatus');
    }
    const POD_TYPE:any = {
      // 确保“当前/需要/可提供”的顺序
      deploymentVOS: ['current', 'desired', 'available'],
      daemonSetVOS: ['currentScheduled', 'desiredScheduled', 'numberAvailable'],
      statefulSetVOS: ['currentReplicas', 'desiredReplicas', 'readyReplicas'],
    };
    const [current, desired, available] = POD_TYPE[podType];
    const deployments = getResources[podType];

    if (!deployments || !deployments.length) return null;

    const getDeploy = (item:any) => {
      const {
        name, age, devopsEnvPodVOS, ports, labels, instanceId,
      } = item;
      const replica = `${item[available] || 0} available / ${item[current] || 0} current / ${item[desired] || 0} desired`;
      const podCount = computedPodCount(devopsEnvPodVOS);
      let portValues = null;
      let labelValues = null;
      if (ports && ports.length) {
        portValues = (
          <div className="c7ncd-instance-details-port">
            <span className="c7ncd-instance-details-value">
              {_.head(ports)}
            </span>
            {ports.length > 1 && (
            <Popover
              arrowPointAtCenter
              placement="bottom"
              getPopupContainer={(triggerNode) => triggerNode.parentNode as any}
              content={_.map(_.tail(ports), (port:any) => <div className="c7ncd-deployment-popover-port" key={port}>{port}</div>)}
            >
              <Icon type="expand_more" className="c7ncd-deployment-icon-more" />
            </Popover>
            )}
          </div>
        );
      }

      if (!_.isEmpty(labels)) {
        const keys = Object.keys(labels);
        const firstKey = keys[0];

        labelValues = (
          <div className="c7ncd-instance-details-label">
            <Label name={firstKey} value={labels[firstKey]} />
            {keys.length > 1 && (
            <Popover
              arrowPointAtCenter
              placement="bottom"
              getPopupContainer={(triggerNode) => triggerNode.parentNode as any}
              content={_.map(_.tail(keys), (key:any) => (
                <Label
                  key={key}
                  name={key}
                  value={labels[key]}
                />
              ))}
            >
              <Icon type="expand_more" className="c7ncd-deployment-icon-more" />
            </Popover>
            )}
          </div>
        );
      }

      return (
        <div key={name} className="c7ncd-instance-details-grid">
          <div>
            {getName(name)}
            <div className="c7ncd-instance-details-item">
              <div className="c7ncd-instance-details-inline">
                <span className="c7ncd-instance-details-key">
                  {podType === 'deploymentVOS' ? 'ReplicaSet' : <FormattedMessage id="status" />}
                  ：
                </span>
                <Tooltip title={replica}>
                  <span className="c7ncd-instance-details-value">{replica}</span>
                </Tooltip>
              </div>
              <div className="c7ncd-instance-details-inline">
                <span className="c7ncd-instance-details-key">
                  <FormattedMessage id="ist.expand.date" />
                  ：
                </span>
                <span className="c7ncd-instance-details-value">
                  <Tooltip title={formatDate(age)}>
                    <TimeAgo
                      datetime={age}
                      locale={Choerodon.getMessage('zh_CN', 'en')}
                    />
                  </Tooltip>
                </span>
              </div>
              {_.has(item, 'labels') && (
              <div className="c7ncd-instance-details-inline">
                <span className="c7ncd-instance-details-key">
                  <FormattedMessage id="label" />
                  ：
                </span>
                {labelValues}
              </div>
              )}
              {_.has(item, 'ports') && (
              <div className="c7ncd-instance-details-inline">
                <span className="c7ncd-instance-details-key">
                  <FormattedMessage id="c7ncd.deployment.port.number" />
                  ：
                </span>
                {portValues}
              </div>
              )}
            </div>
            <Button
              className="c7ncd-detail-btn"
              type="primary"
              onClick={(() => handleClick(podType, name, instanceId))}
            >
              <FormattedMessage id="detailMore" />
            </Button>
          </div>
          <Pods
            podType={podType}
            connect={connect}
            name={name}
            count={podCount}
            targetCount={targetCount}
            status={status}
            instanceStatus={instanceStatus}
            handleChangeCount={changeTargetCount}
            store={runDetailsStore}
            envId={envId}
            refresh={loadData}
          />
        </div>
      );
    };

    return _.map(deployments, getDeploy);
  };

  /**
   * PVC service ingress 三个没有pod圈
   * @param type
   */
  const getNoPodContent = (type:any) => {
    const resources = getResources[type];

    if (!resources || !resources.length) return null;
    const TYPE_KEY:any = {
      serviceVOS: ['type', 'age', 'externalIp', 'port', 'clusterIp'],
      ingressVOS: ['hosts', 'age', 'address', 'ports', 'services'],
      persistentVolumeClaimVOS: ['status', 'age', 'accessModes', 'capacity'],
    };

    return _.map(resources, (data:any) => {
      const content = (key:any) => {
        let text = null;
        switch (key) {
          case 'age':
            text = (
              <Tooltip title={formatDate(data[key])}>
                <TimeAgo
                  datetime={data[key]}
                  locale={Choerodon.getMessage('zh_CN', 'en')}
                />
              </Tooltip>
            );
            break;
          case 'status':
            text = (
              <span className={`c7ncd-deploy-pvc c7ncd-deploy-pvc_${data[key]}`}>
                {data[key]}
              </span>
            );
            break;
          case 'services':
            text = (
              <>
                <span className="c7ncd-instance-details-value">
                  {_.head(data[key])}
                </span>
                {data[key].length > 1 && (
                <Popover
                  arrowPointAtCenter
                  placement="bottom"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode as any}
                  content={_.map(_.tail(data[key]), (ingress:any) => <div className="c7ncd-deployment-popover-port" key={ingress}>{ingress}</div>)}
                >
                  <Icon type="expand_more" className="c7ncd-deployment-icon-more" />
                </Popover>
                )}
              </>
            );
            break;
          case 'hosts':
            text = (
              <Tooltip title={data[key]}>
                <span>{data[key]}</span>
              </Tooltip>
            );
            break;
          default:
            text = data[key];
            break;
        }
        return (
          <li className="c7ncd-instance-details-inline">
            <span className="c7ncd-instance-details-key">
              <FormattedMessage id={`ist.expand.net.${key}`} />
              ：
            </span>
            <span className="c7ncd-instance-details-value">{text}</span>
          </li>
        );
      };
      return (
        <div key={data.name} className="c7ncd-instance-details-grid">
          <div>
            {getName(data.name)}
            <div className="c7ncd-instance-details-item">
              {_.map(TYPE_KEY[type], (item:any) => content(item))}
            </div>
          </div>
        </div>
      );
    });
  };

  const hideSidebar = () => {
    setVisible(false);
    runDetailsStore.setDeployments([]);
  };

  const contentList = [{
    title: 'Deployments',
    main: getDeployContent('deploymentVOS'),
  }, {
    title: 'Stateful Set',
    main: getDeployContent('statefulSetVOS'),
  }, {
    title: 'Daemon Set',
    main: getDeployContent('daemonSetVOS'),
  }, {
    title: 'PVC',
    main: getNoPodContent('persistentVolumeClaimVOS'),
  }, {
    title: 'Service',
    main: getNoPodContent('serviceVOS'),
  }, {
    title: 'Ingress',
    main: getNoPodContent('ingressVOS'),
  }];
  const hasContent = _.find(contentList, (item:any) => item.main && item.main.length);

  return (
    <>
      <Spin spinning={getLoading}>
        <div className="c7ncd-instance-details">
          <div className="c7ncd-instance-details-inner">
            {!hasContent ? (
              <TabEmptyPage text={<FormattedMessage id={`${intlPrefix}.instance.detail.empty`} />} />
            ) : getContent(contentList)}
          </div>
        </div>
      </Spin>
      {visible && (
      <DetailsSidebar
        visible={visible}
        onClose={hideSidebar}
        runDetailsStore={runDetailsStore}
        formatMessage={formatMessage}
      />
      )}
    </>
  );
});

function computedPodCount(collection:any) {
  // 计算 pod 数量和环形图占比
  const count = _.countBy(collection, (pod:any) => !!pod.ready);
  // 通过 ready 字段进行分类计数，分类结果是 true 和 false 的数量
  const correctCount = count.true || 0;
  const errorCount = count.false || 0;
  const sum = correctCount + errorCount;
  const correct = sum > 0 ? (correctCount / sum) * (Math.PI * 2 * 30) : 0;
  return {
    sum,
    correct,
    correctCount,
  };
}

function getContent(data:any) {
  return _.map(data, ({ main, title }:any) => (main && main.length ? (
    <div className="c7ncd-instance-details-panel" key={title}>
      <div className="c7ncd-instance-details-title">
        <span>{title}</span>
      </div>
      {main}
    </div>
  ) : null));
}

function getName(name:any) {
  return (
    <div className="c7ncd-instance-details-block">
      <span className="c7ncd-instance-details-item-keys">
        <FormattedMessage id="name" />
        ：
      </span>
      <span
        title={name}
        className="c7ncd-instance-details-item-values c7ncd-expanded-text_bold"
      >
        {name}
      </span>
    </div>
  );
}
