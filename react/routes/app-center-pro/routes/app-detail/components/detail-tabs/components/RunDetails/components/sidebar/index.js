import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import _ from 'lodash';
import {
  Button, Modal, Collapse, Spin,
} from 'choerodon-ui';
// import Store from '../../stores';
import YamlEditor from '@/components/yamlEditor';
import SimpleTable from './SimpleTable';

import './index.less';

const { Sidebar } = Modal;
const { Panel } = Collapse;

const PANEL_TYPE = [
  'ports',
  'volume',
  'health',
  'security',
  'label',
  'variables',
];

const ContainerLabel = () => (
  <span className="c7ncd-deploy-container-label">
    <FormattedMessage id="ist.deploy.container" />
  </span>
);

@observer
export default class DetailsSidebar extends Component {
  // eslint-disable-next-line react/static-property-placement
  // static contextType = Store;

  // eslint-disable-next-line react/state-in-constructor
  state = {
    activeKey: [],
    isJson: true,
  };

  handlePanelChange = (key) => {
    const isExpand = key.length === PANEL_TYPE.length;
    this.setState({ activeKey: key, isExpand });
  };

  handleExpandAll = () => {
    this.setState((prev) => ({
      isExpand: !prev.isExpand,
      activeKey: !prev.isExpand ? PANEL_TYPE : [],
    }));
  };

  handleChangeType = () => {
    this.setState((prev) => ({
      isJson: !prev.isJson,
    }));
  };

  renderHealth = (containers) => {
    let healthContent = null;

    if (containers && containers.length) {
      healthContent = _.map(containers, (item) => {
        const { name } = item;
        const readinessProbe = item.readinessProbe || {};
        const livenessProbe = item.livenessProbe || {};

        const readDom = returnHealthDom('readiness', readinessProbe);
        const liveDom = returnHealthDom('liveness', livenessProbe);

        return (
          <div key={name} className="c7ncd-deploy-health-wrap">
            <div className="c7ncd-deploy-container-title">
              <span className="c7ncd-deploy-container-name">{name}</span>
              <ContainerLabel />
            </div>
            <div className="c7ncd-deploy-health-content">
              {readDom}
              {liveDom}
            </div>
          </div>
        );
      });
    } else {
      healthContent = (
        <div className="c7ncd-deploy-detail-empty">
          <p>
            <FormattedMessage id="ist.deploy.health.readiness" />
          </p>
          <FormattedMessage id="ist.deploy.volume.type" />
          <span className="c7ncd-deploy-health-empty">
            <FormattedMessage id="ist.deploy.none" />
          </span>
        </div>
      );
    }

    return healthContent;
  };

  renderVar = (containers) => {
    const columns = [
      {
        width: '50%',
        title: <FormattedMessage id="ist.deploy.variables.key" />,
        key: 'name',
        dataIndex: 'name',
      },
      {
        width: '50%',
        title: <FormattedMessage id="ist.deploy.variables.value" />,
        key: 'value',
        dataIndex: 'value',
      },
    ];

    let hasEnv = false;
    let envContent = _.map(containers, ({ name, env }) => {
      if (env && env.length) {
        hasEnv = true;
      }
      return (
        <Fragment key={name}>
          <div className="c7ncd-deploy-container-title">
            <span className="c7ncd-deploy-container-name">{name}</span>
            <ContainerLabel />
          </div>
          <div className="c7ncd-deploy-container-table">
            <SimpleTable columns={columns} data={env && env.slice()} />
          </div>
        </Fragment>
      );
    });

    if (!hasEnv) {
      envContent = (
        <div className="c7ncd-deploy-empty-table">
          <SimpleTable columns={columns} data={[]} />
        </div>
      );
    }

    return envContent;
  };

  renderPorts(containers) {
    let portsContent = null;
    let hasPorts = false;

    if (containers && containers.length) {
      const colItems = ['name', 'containerPort', 'protocol', 'hostPort'];
      const columns = _.map(colItems, (item) => ({
        title: <FormattedMessage id={`ist.deploy.ports.${item}`} />,
        key: item,
        dataIndex: item,
        render: textOrNA,
      }));

      portsContent = _.map(containers, (item) => {
        const { name, ports } = item;
        if (ports && ports.length) {
          hasPorts = true;
        }
        return (
          <Fragment key={name}>
            <div className="c7ncd-deploy-container-title">
              <span className="c7ncd-deploy-container-name">{name}</span>
              {this.containerLabel}
            </div>
            <div className="c7ncd-deploy-container-table">
              <SimpleTable columns={columns} data={ports && ports.slice()} />
            </div>
          </Fragment>
        );
      });
    } else {
      portsContent = (
        <div className="c7ncd-deploy-detail-empty">
          <FormattedMessage id="ist.deploy.ports.map" />
          <FormattedMessage id="ist.deploy.ports.empty" />
        </div>
      );
    }

    if (!hasPorts) {
      portsContent = (
        <div className="c7ncd-deploy-detail-empty">
          <FormattedMessage id="ist.deploy.ports.map" />
          <FormattedMessage id="ist.deploy.ports.empty" />
        </div>
      );
    }

    return portsContent;
  }

  renderLabel = (labels, annotations) => {
    /**
     * 表格数据
     * @param {object} obj
     * @param {array} col
     */
    function format(obj, col) {
      const arr = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          arr.push({ key, value });
        }
      }
      return (
        <div className="c7ncd-deploy-container-table">
          <SimpleTable columns={columns} data={arr} />
        </div>
      );
    }

    const columns = [
      {
        width: '50%',
        title: <FormattedMessage id="ist.deploy.key" />,
        key: 'key',
        dataIndex: 'key',
      },
      {
        width: '50%',
        title: <FormattedMessage id="ist.deploy.value" />,
        key: 'value',
        dataIndex: 'value',
      },
    ];

    const labelContent = format(labels, columns);
    const annoContent = format(annotations, columns);

    return (
      <>
        <div className="c7ncd-deploy-label">Labels</div>
        {labelContent}
        <div className="c7ncd-deploy-label">Annotations</div>
        {annoContent}
      </>
    );
  };

  renderVolume = (containers, volumes) => {
    let volumeContent = null;

    const volumeType = (vol, mounts) => {
      const vDom = volumesTemplate(vol);
      const columnsItem = ['mountPath', 'subPath', 'readOnly'];
      const columns = _.map(columnsItem, (item) => ({
        title: <FormattedMessage id={`ist.deploy.volume.${item}`} />,
        key: item,
        dataIndex: item,
        width: item === 'readOnly' ? '16%' : '42%',
        render(text) {
          return _.isBoolean(text) ? text.toString() : text;
        },
      }));

      return (
        <div key={vol.name} className="c7ncd-deploy-volume-wrap">
          {vDom}
          <SimpleTable
            columns={columns}
            data={mounts}
            rowKey={(record) => record.key}
          />
        </div>
      );
    };

    if (volumes && volumes.length) {
      volumeContent = _.map(volumes, (vol) => {
        const { name } = vol;
        const mounts = [];
        _.forEach(containers, (item) => {
          const { volumeMounts } = item;
          const filterVol = _.filter(volumeMounts, (m) => m.name === name);
          mounts.push(...filterVol);
        });
        return volumeType(vol, mounts);
      });
    } else {
      volumeContent = (
        <div className="c7ncd-deploy-detail-empty">
          <FormattedMessage id="ist.deploy.volume" />
          <FormattedMessage id="ist.deploy.volume.empty" />
        </div>
      );
    }

    return volumeContent;
  };

  renderSecurity = (containers, hostIPC, hostNetwork) => {
    const containerArr = containers.length ? containers : [{}];
    const securityCtx = _.map(containerArr, (item) => {
      const { imagePullPolicy, name } = item;
      const securityContext = item.securityContext || {};
      const {
        privileged,
        allowPrivilegeEscalation,
        readOnlyRootFilesystem,
        runAsNonRoot,
        capabilities,
      } = securityContext;

      let capAdd = [];
      let capDrop = [];

      if (!_.isEmpty(capabilities)) {
        capAdd = capabilities.add;
        capDrop = capabilities.drop;
      }

      const addArr = capAdd.length ? (
        _.map(capAdd, (text) => (
          <p className="c7ncd-deploy-detail-text">{text}</p>
        ))
      ) : (
        <FormattedMessage id="ist.deploy.none" />
      );
      const dropArr = capDrop.length ? (
        _.map(capDrop, (text) => (
          <p className="c7ncd-deploy-detail-text">{text}</p>
        ))
      ) : (
        <FormattedMessage id="ist.deploy.none" />
      );

      return (
        <Fragment key={name}>
          <div className="c7ncd-deploy-container-title">
            <span className="c7ncd-deploy-container-name">{name}</span>
            <ContainerLabel />
          </div>
          <div className="c7ncd-deploy-security-block">
            {securityItem('imagePullPolicy', imagePullPolicy, '_flex')}
            {securityItem('privileged', privileged, '_flex')}
            {securityItem(
              'allowPrivilegeEscalation',
              allowPrivilegeEscalation,
              '_flex',
            )}
          </div>
          <div className="c7ncd-deploy-security-block">
            {securityItem('runAsNonRoot', runAsNonRoot)}
            {securityItem('readOnlyRootFilesystem', readOnlyRootFilesystem)}
          </div>
          <div className="c7ncd-deploy-security-block">
            {securityItem('capabilities.add', addArr)}
            {securityItem('capabilities.drop', dropArr)}
          </div>
        </Fragment>
      );
    });

    return (
      <div className="c7ncd-deploy-security-wrap">
        <div className="c7ncd-deploy-security-block">
          {securityItem('hostIPC', hostIPC)}
          {securityItem('hostNetwork', hostNetwork)}
        </div>
        {securityCtx}
      </div>
    );
  };

  render() {
    const {
      visible,
      onClose,
      withoutStore,
      json,
      yaml,
      runDetailsStore,
      formatMessage: contextFormat,
    } = this.props;
    const { activeKey, isExpand, isJson } = this.state;

    let detail;
    let getDeploymentsYaml;
    let formatMessage;

    if (!withoutStore) {
      const {
        getDeployments: { detail: storeDetail },
        getDeploymentsYaml: storeYaml,
      } = runDetailsStore;
      detail = storeDetail;
      getDeploymentsYaml = storeYaml;
      formatMessage = contextFormat;
    } else {
      // eslint-disable-next-line react/destructuring-assignment
      formatMessage = this.props.formatMessage;
      detail = json;
      getDeploymentsYaml = yaml;
    }

    let containers = [];
    let volumes = [];
    let hostIPC = null;
    let hostNetwork = null;
    let labels = [];
    let annotations = [];

    if (detail) {
      if (detail.metadata) {
        labels = detail.metadata.labels;
        annotations = detail.metadata.annotations;
      }
      if (detail.spec && detail.spec.template && detail.spec.template.spec) {
        const { spec } = detail.spec.template;
        containers = spec.containers;
        volumes = spec.volumes;
        hostIPC = spec.hostIPC;
        hostNetwork = spec.hostNetwork;
      }
    }

    const renderFun = {
      ports: () => this.renderPorts(containers),
      volume: () => this.renderVolume(containers, volumes),
      health: () => this.renderHealth(containers),
      variables: () => this.renderVar(containers),
      security: () => this.renderSecurity(containers, hostIPC, hostNetwork),
      label: () => this.renderLabel(labels, annotations),
    };

    return (
      <Sidebar
        destroyOnClose
        visible
        footer={[
          <Button
            type="primary"
            funcType="raised"
            key="close"
            onClick={onClose}
          >
            <FormattedMessage id="close" />
          </Button>,
        ]}
        title={formatMessage({ id: `ist.deploy.${detail ? detail.kind : 'Deployment'}.detail` })}
      >
        <div className="c7ncd-expand-btn-wrap">
          <Button
            className="c7ncd-deploy-detail-type-btn"
            onClick={this.handleChangeType}
            style={{
              display: ['Job', 'CronJob'].includes(detail.kind) ? 'none' : 'block',
            }}
          >
            <FormattedMessage id={`ist.deploy.type.${isJson ? 'yaml' : 'json'}`} />
          </Button>
          {isJson && !['Job', 'CronJob'].includes(detail.kind) && (
          <Button
            className="c7ncd-expand-btn"
            onClick={this.handleExpandAll}
          >
            <FormattedMessage id={isExpand ? 'collapseAll' : 'expandAll'} />
          </Button>
          )}
        </div>
        {isJson && !['Job', 'CronJob'].includes(detail.kind) ? (
          <Collapse
            bordered={false}
            activeKey={activeKey}
            onChange={this.handlePanelChange}
          >
            {_.map(PANEL_TYPE, (item) => (
              <Panel
                key={item}
                header={(
                  <div className="c7ncd-deploy-panel-header">
                    <div className="c7ncd-deploy-panel-title">
                      <FormattedMessage id={`ist.deploy.${item}`} />
                    </div>
                    <div className="c7ncd-deploy-panel-text">
                      <FormattedMessage id={`ist.deploy.${item}.describe`} />
                    </div>
                  </div>
              )}
                className="c7ncd-deploy-panel"
              >
                {visible && renderFun[item]()}
              </Panel>
            ))}
          </Collapse>
        ) : (
          <YamlEditor
            value={getDeploymentsYaml}
            originValue={getDeploymentsYaml}
            readOnly
          />
        )}
      </Sidebar>
    );
  }
}

/**
 * 内容为空时返回 n/a
 */
function textOrNA(text) {
  if (!text && !_.isBoolean(text)) {
    return 'n/a';
  }
  return String(text);
}

/**
 * 返回健康检查的DOM
 * @param {string} name
 * @param {obj} data
 */
function returnHealthDom(name, data) {
  const items = [
    'failureThreshold',
    'initialDelaySeconds',
    'periodSeconds',
    'successThreshold',
    'timeoutSeconds',
  ];

  return (
    <div className="c7ncd-deploy-health-block">
      <div className="c7ncd-deploy-health-title">
        <FormattedMessage id={`ist.deploy.health.${name}`} />
      </div>
      <div className="c7ncd-deploy-health-main">
        {_.map(items, (item) => (
          <div className="c7ncd-deploy-health-item">
            <p className="c7ncd-deploy-detail-label">
              <FormattedMessage id={`ist.deploy.health.${item}`} />
            </p>
            <p className="c7ncd-deploy-detail-text">{textOrNA(data[item])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 返回数据卷的项目 DOM
 * @param name
 * @param data
 * @param isBool
 * @returns {*}
 */
function volumesItem(name, data, isBool = false) {
  const value = isBool && _.isBoolean(data) ? data.toString() : data;

  return (
    <div className="c7ncd-deploy-volume-item">
      <p className="c7ncd-deploy-detail-label">
        <FormattedMessage id={`ist.deploy.volume.${name}`} />
      </p>
      <p className="c7ncd-deploy-detail-text">{value}</p>
    </div>
  );
}

function volumesTemplate(data) {
  let template = null;
  const VOL_TYPE = ['configMap', 'persistentVolumeClaim', 'cipher', 'hostPath'];
  const vKey = Object.keys(data);
  const { name } = data;

  let type = _.toString(_.filter(VOL_TYPE, (item) => vKey.includes(item)));
  switch (type) {
    case 'configMap':
    case 'cipher': {
      const { defaultMode, items, optional } = data[type];
      let itemDom = null;
      if (items && items.length) {
        const columns = [
          {
            title: <FormattedMessage id="ist.deploy.volume.config.key" />,
            key: 'key',
            dataIndex: 'key',
          },
          {
            title: <FormattedMessage id="ist.deploy.volume.config.mode" />,
            key: 'mode',
            dataIndex: 'mode',
          },
          {
            title: <FormattedMessage id="ist.deploy.volume.config.path" />,
            key: 'path',
            dataIndex: 'path',
          },
        ];
        itemDom = <SimpleTable columns={columns} data={items} />;
      } else {
        itemDom = (
          <p className="c7ncd-deploy-detail-text">
            <FormattedMessage id="null" />
          </p>
        );
      }
      template = (
        <div className="c7ncd-deploy-volume-main">
          {volumesItem('defaultMode', defaultMode)}
          {volumesItem('optional', optional, true)}
          <div className={`c7ncd-deploy-volume-item${items ? '_full' : ''}`}>
            <p className="c7ncd-deploy-detail-label">
              <FormattedMessage id="ist.deploy.volume.item" />
            </p>
            {itemDom}
          </div>
        </div>
      );
      break;
    }
    case 'persistentVolumeClaim': {
      const { claimName, readOnly } = data[type];
      template = (
        <div className="c7ncd-deploy-volume-main">
          {volumesItem('claimName', claimName)}
          {volumesItem('readOnly', readOnly, true)}
        </div>
      );
      break;
    }
    case 'hostPath': {
      const { path } = data[type];
      template = (
        <div className="c7ncd-deploy-volume-main">
          {volumesItem('path', path)}
          {volumesItem('type', type)}
        </div>
      );
      break;
    }

    default:
      type = '未知';
      break;
  }
  return (
    <>
      <div className="c7ncd-deploy-volume-main">
        {volumesItem('name', name)}
        {volumesItem('volume.type', type)}
      </div>
      {template}
    </>
  );
}

function securityItem(name, data, type = '') {
  const content = _.isArray(data) || _.isObject(data) ? (
    data
  ) : (
    <p className="c7ncd-deploy-detail-text">{textOrNA(data)}</p>
  );
  return (
    <div className={`c7ncd-deploy-security-item${type}`}>
      <p className="c7ncd-deploy-detail-label">
        <FormattedMessage id={`ist.deploy.security.${name}`} />
      </p>
      {content}
    </div>
  );
}
