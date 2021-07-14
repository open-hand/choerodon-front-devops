import React, { useMemo, useState } from 'react';
import {
  Button, Form, Icon, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { axios } from '@choerodon/boot';
import { mapping } from '@/routes/deployment/modals/deploy/stores/ManualDeployDataSet';
import YamlEditor from '../../../../components/yamlEditor';
import Tips from '../../../../components/new-tips';
import { useManualDeployStore } from './stores';

const { Option } = Select;

const HostDeployForm = injectIntl(observer(({ getMarketItem, getMarketAndVersionContent }) => {
  const {
    manualDeployDs,
    AppState: { currentMenuType: { projectId } },
    deployUseStore,
    prefixCls,
  } = useManualDeployStore();

  const record = manualDeployDs.current;

  const [testStatus, setTestStatus] = useState('');
  const isMarket = record.get(mapping.deploySource.value) === (mapping.deploySource.options.length > 1 ? mapping.deploySource.options[1].value : '');
  const isDocker = record.get(mapping.deployObject.value) === mapping.deployObject.options[0].value;
  const getWorkPathTips = useMemo(() => (
    <Tips
      helpText={(
        <>
          <p style={{ margin: 0 }}>
            默认工作目录，当前工作目录(./)，jar包下载存放目录为：./temp-jar/xxx.jar 日志存放目录为：./temp-log/xxx.log
          </p>
          <p style={{ margin: 0 }}>
            填写工作目录，jar包下载存放目录为：工作目录/temp-jar/xxx.jar 日志存放目录为：工作目录/temp-jar/xxx.log
          </p>
        </>
      )}
    />
  ), []);

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

  return (
    <div style={{ width: '80%' }}>
      <div className="c7ncd-deploy-manual-deploy-divided" />
      <p className="c7ncd-deploy-manual-deploy-title">主机设置</p>
      <Form record={record} columns={2}>
        <Select
          colSpan={1}
          name={mapping.hostName.value}
          // onChange={handleChangeHostName}
          addonAfter={<Tips helpText="您需在此选择一个此项目下”主机配置“中已有的主机作为部署的载体" placement="bottom" />}
        />
        {/* 不在有ip和端口 */}
        {/* <div style={{ display: 'flex', alignItems: 'flex-start' }} colSpan={1}>
          <div style={{ width: '70%' }}>
            <TextField style={{ width: '100%' }} name={mapping.ip.value} />
          </div>
          <div style={{ marginLeft: 10, flex: 1 }}>
            <TextField name={mapping.port.value} />
          </div>
        </div> */}
      </Form>
      {/* <Button
        color="primary"
        funcType="raised"
        disabled={!record.get(mapping.ip.value) || !record.get(mapping.port.value)}
        onClick={handleTestConnect}
      >
        测试连接
      </Button>
      {getTestDom()} */}
      <div style={{ marginTop: 10 }} className="c7ncd-deploy-manual-deploy-divided" />
      <p className="c7ncd-deploy-manual-deploy-title">部署模式</p>
      <Form columns={7} record={record} style={{ width: '125%' }}>
        <SelectBox colSpan={4} name={mapping.deploySource.value}>
          {
            mapping.deploySource.options.map((o) => (
              <Option value={o.value}>
                <span className={`${prefixCls}-manual-deploy-radio`}>{o.label}</span>
              </Option>
            ))
          }
        </SelectBox>
        <SelectBox colSpan={1} name={mapping.deployObject.value}>
          {
            mapping.deployObject.options.map((o) => (
              <Option value={o.value}>
                <span className={`${prefixCls}-manual-deploy-radio`}>
                  <img src={o.img} />
                  {o.label}
                </span>
              </Option>
            ))
          }
        </SelectBox>
      </Form>
      <Form columns={2} record={record}>
        {!isMarket && (
          isDocker ? [
            <Select
              newLine
              name={mapping.projectImageRepo.value}
              colSpan={1}
              onChange={() => {
                record.init(mapping.image.value);
                record.init(mapping.imageVersion.value);
              }}
            />,
            <Select
              name={mapping.image.value}
              colSpan={1}
              onChange={() => {
                record.init(mapping.imageVersion.value);
              }}
            />,
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
              addonAfter={getWorkPathTips}
            />,
            <YamlEditor
              colSpan={2}
              readOnly={false}
              modeChange={false}
              value={deployUseStore.getJarYaml}
              onValueChange={(value) => deployUseStore.setJarYaml(value)}
            />,
          ]
        )}
      </Form>
      {isMarket && (
        <Form columns={7} record={record} style={{ width: '125%' }}>
          {getMarketItem(2)}
          {
            isDocker ? [
              <TextField
                name={mapping.containerName.value}
                colSpan={2}
              />,
              <YamlEditor
                colSpan={7}
                readOnly={false}
                value={deployUseStore.getImageYaml}
                onValueChange={(value) => deployUseStore.setImageYaml(value)}
              />,
            ] : [
              <TextField
                name={mapping.workPath.value}
                addonAfter={getWorkPathTips}
                colSpan={2}
              />,
              <YamlEditor
                colSpan={7}
                readOnly={false}
                modeChange={false}
                value={deployUseStore.getJarYaml}
                onValueChange={(value) => deployUseStore.setJarYaml(value)}
              />,
            ]
          }
        </Form>
      )}
    </div>
  );
}));

export default HostDeployForm;
