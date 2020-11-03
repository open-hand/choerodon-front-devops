import React, { Fragment, useEffect, useState } from 'react';
import {
  Button, Form, Icon, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { Form as OldForm, Spin } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { axios } from '@choerodon/boot';
import forEach from 'lodash/forEach';
import { mapping } from '@/routes/deployment/modals/deploy/stores/ManualDeployDataSet';
import YamlEditor from '../../../../components/yamlEditor';
import StatusDot from '../../../../components/status-dot';
import Tips from '../../../../components/new-tips';
import NetworkForm from './NetworkForm';
import DomainForm from './DomainForm';
import { useManualDeployStore } from './stores';

import './index.less';

const { Option, OptGroup } = Select;

const DeployModal = injectIntl(observer(({ form }) => {
  const {
    manualDeployDs,
    deployStore,
    refresh,
    intlPrefix,
    prefixCls,
    modal,
    intl: { formatMessage },
    envId,
    AppState: { currentMenuType: { projectId } },
    deployUseStore,
  } = useManualDeployStore();

  const record = manualDeployDs.current;

  const [hasYamlFailed, setHasYamlFailed] = useState(false);
  const [resourceIsExpand, setResourceIsExpand] = useState(false);
  const [netIsExpand, setNetIsExpand] = useState(false);
  const [ingressIsExpand, setIngressIsExpand] = useState(false);
  const [testStatus, setTestStatus] = useState('');

  useEffect(() => {
    if (envId) {
      record.init('environmentId', envId);
    }
  }, [envId]);

  useEffect(() => {
    ChangeConfigValue(deployStore.getConfigValue);
  }, [deployStore.getConfigValue]);

  // eslint-disable-next-line consistent-return
  modal.handleOk(async () => {
    if (hasYamlFailed) return false;
    try {
      const res = await manualDeployDs.submit();
      if (res !== false) {
        refresh(res.list[0]);
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  });

  function ChangeConfigValue(value) {
    record.set('values', value);
  }

  function handleEnableNext(flag) {
    setHasYamlFailed(flag);
  }

  function renderEnvOption({ record: envRecord, text, value }) {
    return (
      <>
        {value && (
        <StatusDot
          connect={envRecord.get('connect')}
          synchronize={envRecord.get('synchro')}
          active={envRecord.get('active')}
          size="small"
        />
        )}
        <span className={`${prefixCls}-select-option-text`}>{text}</span>
      </>
    );
  }

  function renderOptionProperty({ record: envRecord }) {
    const isAvailable = envRecord.get('connect') && envRecord.get('synchro') && envRecord.get('permission');
    return ({
      disabled: !isAvailable,
    });
  }

  function handleExpand(Operating) {
    Operating((pre) => !pre);
  }

  /**
   * 主机名称下拉改变回调 设置ip和端口
   * @param value
   */
  const handleChangeHostName = (value) => {
    const { lookup } = record.getField(mapping.hostName.value);
    const item = lookup.find((l) => l.id === value);
    if (item) {
      const { hostIp, sshPort } = item;
      record.set(mapping.ip.value, hostIp);
      record.set(mapping.port.value, sshPort);
    } else {
      record.set(mapping.ip.value, undefined);
      record.set(mapping.port.value, undefined);
    }
  };

  const getTestDom = () => {
    const res = {
      loading: (
        <div className="testConnectCD">
          正在进行连接测试
          <Spin />
        </div>
      ),
      success: (
        <div
          style={{
            background: 'rgba(0,191,165,0.04)',
            borderColor: 'rgba(0,191,165,1)',
          }}
          className="testConnectCD"
        >
          <span style={{ color: '#3A345F' }}>测试连接：</span>
          <span style={{ color: '#00BFA5' }}>
            <Icon
              style={{
                border: '1px solid rgb(0, 191, 165)',
                borderRadius: '50%',
                marginRight: 2,
                fontSize: '9px',
              }}
              type="done"
            />
            成功
          </span>
        </div>
      ),
      error: (
        <div
          style={{
            background: 'rgba(247,122,112,0.04)',
            borderColor: 'rgba(247,122,112,1)',
          }}
          className="testConnectCD"
        >
          <span style={{ color: '#3A345F' }}>测试连接：</span>
          <span style={{ color: '#F77A70' }}>
            <Icon
              style={{
                border: '1px solid #F77A70',
                borderRadius: '50%',
                marginRight: 2,
                fontSize: '9px',
              }}
              type="close"
            />
            失败
          </span>
        </div>
      ),
    };
    return res[testStatus];
  };

  /**
   * 测试连接逻辑
   */
  const handleTestConnect = async () => new Promise((resolve) => {
    setTestStatus('loading');
    const hostIp = record.get(mapping.ip.value);
    const hostPort = record.get(mapping.port.value);
    const hostId = record.get(mapping.hostName.value);
    axios.post(`/devops/v1/projects/${projectId}/hosts/connection_test_by_id?host_id=${hostId}`, {
      hostIp,
      hostPort,
    }).then((res) => {
      setTestStatus(res ? 'success' : 'error');
      resolve();
    }).catch(() => {
      setTestStatus('error');
      resolve();
    });
  });

  /**
   * 主机部署逻辑
   */
  const renderHostDeploy = () => (
    <div style={{ width: '80%' }}>
      <div className="c7ncd-deploy-manual-deploy-divided" />
      <p className="c7ncd-deploy-manual-deploy-title">主机设置</p>
      <Form record={record} columns={2}>
        <Select
          colSpan={1}
          name={mapping.hostName.value}
          onChange={handleChangeHostName}
          showHelp="tooltip"
          help="您需在此选择一个此项目下”主机配置“中已有的主机作为步骤的载体"
        />
        <div style={{ display: 'flex', alignItems: 'flex-start' }} colSpan={1}>
          <div style={{ width: '70%' }}>
            <TextField style={{ width: '100%' }} name={mapping.ip.value} />
          </div>
          <div style={{ marginLeft: 10, flex: 1 }}>
            <TextField name={mapping.port.value} />
          </div>
        </div>
      </Form>
      <Button
        color="primary"
        funcType="raised"
        disabled={!record.get(mapping.ip.value) || !record.get(mapping.port.value)}
        onClick={handleTestConnect}
      >
        测试连接
      </Button>
      {getTestDom()}
      <div style={{ marginTop: 10 }} className="c7ncd-deploy-manual-deploy-divided" />
      <p className="c7ncd-deploy-manual-deploy-title">部署模式</p>
      <Form columns={2} record={record}>
        <SelectBox colSpan={1} name={mapping.deployObject.value}>
          {
            mapping.deployObject.options.map((o) => (
              <Option value={o.value}>{o.label}</Option>
            ))
          }
        </SelectBox>
        {
          record.get(mapping.deployObject.value) === mapping.deployObject.options[0].value ? [
            <Select newLine name={mapping.projectImageRepo.value} colSpan={1} />,
            <Select name={mapping.image.value} colSpan={1} />,
            <Select name={mapping.imageVersion.value} colSpan={1} />,
            <TextField name={mapping.containerName.value} colSpan={1} />,
            <YamlEditor
              colSpan={2}
              readOnly={false}
              // modeChange={false}
              value={deployUseStore.getImageYaml}
              onValueChange={(value) => deployUseStore.setImageYaml(value)}
            />,
          ] : [
            <Select newLine name={mapping.nexus.value} colSpan={1} />,
            <Select name={mapping.projectProduct.value} colSpan={1} />,
            <Select name={mapping.groupId.value} colSpan={1} />,
            <Select name={mapping.artifactId.value} colSpan={1} />,
            <Select name={mapping.jarVersion.value} colSpan={1} />,
            <TextField
              name={mapping.workPath.value}
              colSpan={1}
              showHelp="tooltip"
              help="123"
            />,
            <YamlEditor
              colSpan={2}
              readOnly={false}
              modeChange={false}
              value={deployUseStore.getJarYaml}
              onValueChange={(value) => deployUseStore.setJarYaml(value)}
            />,
          ]
        }

      </Form>
    </div>
  );

  const renderRestForm = () => (
    record.get(mapping.deployWay.value) === mapping.deployWay.options[0].value
      ? (
        <>
          <Tips
            helpText={formatMessage({ id: `${intlPrefix}.source.tips` })}
            title={formatMessage({ id: `${intlPrefix}.source` })}
          />
          <Form record={record} columns={3}>
            <SelectBox name="appServiceSource" colSpan={1}>
              <Option value="normal_service">
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  {formatMessage({ id: `${intlPrefix}.source.project` })}
                </span>
              </Option>
              <Option value="share_service">
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  {formatMessage({ id: `${intlPrefix}.source.organization` })}
                </span>
              </Option>
            </SelectBox>
            <Select
              name="appServiceId"
              searchable
              newLine
              notFoundContent={<FormattedMessage id={`${intlPrefix}.app.empty`} />}
            >
              {record.get('appServiceSource') === 'normal_service' ? (
                map(deployStore.getAppService[0]
                && deployStore.getAppService[0].appServiceList, ({ id, name, code }) => (
                  <Option value={`${id}**${code}`} key={id}>{name}</Option>
                ))
              ) : (
                map(deployStore.getAppService,
                  ({ id: groupId, name: groupName, appServiceList }) => (
                    <OptGroup label={groupName} key={groupId}>
                      {map(appServiceList, ({ id, name, code }) => (
                        <Option value={`${id}**${code}`} key={id}>{name}</Option>
                      ))}
                    </OptGroup>
                  ))
              )}
            </Select>
            <Select
              name="appServiceVersionId"
              searchable
              searchMatcher="version"
              disabled={!record.get('appServiceId')}
            />
            {!envId
              ? (
                <Select
                  name="environmentId"
                  searchable
                  newLine
                  optionRenderer={renderEnvOption}
                  notFoundContent={<FormattedMessage id={`${intlPrefix}.env.empty`} />}
                  onOption={renderOptionProperty}
                />
              ) : null}
            <TextField
              name="instanceName"
              addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.instance.tips` })} />}
              colSpan={!envId ? 1 : 2}
              newLine={!!envId}
            />
            <Select
              name="valueId"
              searchable
              colSpan={2}
              newLine
              clearButton
              addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.config.tips` })} />}
              notFoundContent={<FormattedMessage id={`${intlPrefix}.config.empty`} />}
            />
            <YamlEditor
              colSpan={3}
              newLine
              readOnly={false}
              originValue={deployStore.getConfigValue}
              value={record.get('values') || deployStore.getConfigValue}
              onValueChange={ChangeConfigValue}
              handleEnableNext={handleEnableNext}
            />
          </Form>
          <div className={`${prefixCls}-resource-config`}>
            <div
              role="none"
              className={`${prefixCls}-resource-config-title`}
              onClick={() => handleExpand(setResourceIsExpand)}
            >
              <FormattedMessage id={`${intlPrefix}.resource`} />
              <Icon
                type={resourceIsExpand ? 'expand_less' : 'expand_more'}
                className={`${prefixCls}-resource-config-icon`}
              />
            </div>
            <div className={resourceIsExpand ? '' : `${prefixCls}-resource-display`}>
              <div
                role="none"
                className={`${prefixCls}-resource-config-network`}
                onClick={() => handleExpand(setNetIsExpand)}
              >
                <Icon
                  type={netIsExpand ? 'expand_less' : 'expand_more'}
                  className={`${prefixCls}-resource-config-network-icon`}
                />
                <FormattedMessage id={`${intlPrefix}.network`} />
              </div>
              <div className={netIsExpand ? `${prefixCls}-resource-content` : `${prefixCls}-resource-display`}>
                <NetworkForm />
              </div>
              <div
                role="none"
                className={`${prefixCls}-resource-config-network`}
                onClick={() => handleExpand(setIngressIsExpand)}
              >
                <Icon
                  type={ingressIsExpand ? 'expand_less' : 'expand_more'}
                  className={`${prefixCls}-resource-config-network-icon`}
                />
                <FormattedMessage id={`${intlPrefix}.ingress`} />
              </div>
              <div className={ingressIsExpand ? `${prefixCls}-resource-content` : `${prefixCls}-resource-display`}>
                <DomainForm />
              </div>
            </div>
          </div>
        </>
      ) : renderHostDeploy());

  return (
    <div className={`${prefixCls}-manual-deploy`}>
      <Form record={record} columns={3}>
        <SelectBox colSpan={1} name={mapping.deployWay.value}>
          {mapping.deployWay.options.map((o) => (
            <Option value={o.value}>
              <span className={`${prefixCls}-manual-deploy-radio`}>
                {o.label}
              </span>
            </Option>
          ))}
        </SelectBox>
      </Form>
      {
        renderRestForm()
      }
    </div>
  );
}));

export default OldForm.create()(DeployModal);
