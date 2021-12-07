/* eslint-disable */
import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  Button, Modal, Spin, Tooltip, Form, Input, Select, Radio, Icon,
} from 'choerodon-ui';
import { Content, Choerodon } from '@choerodon/master';
import classnames from 'classnames';
import _ from 'lodash';
import uuidv1 from 'uuid/v1';
import PipelineCreateStore from '../../stores/PipelineCreateStore';
import Tips from '../../../../components/Tips';
import YamlEditor from '../../../../components/yamlEditor';
import {
  TASK_TYPE_MANUAL,
  TASK_TYPE_DEPLOY,
  STAGE_FLOW_AUTO,
  MODE_TYPE_NEW,
  MODE_TYPE_UPDATE,
  VERSION_TYPE,
  AUDIT_MODE_ORSING,
  AUDIT_MODE_SING, TASK_PARALLEL,
  TRIGGER_TYPE_AUTO,
} from '../Constants';
import StatusDot from '../../../../components/status-dot';

import './TaskCreate.less';

const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};

/**
 * 0 或签 | 1 会签
 * @type {{orSign: number, sign: number}}
 */
const auditMode = {
  sign: 1,
  orSign: 0,
};

@Form.create({})
@injectIntl
@inject('AppState')
@observer
export default class TaskCreate extends Component {
  state = {
    submitting: false,
    taskType: TASK_TYPE_DEPLOY,
    mode: MODE_TYPE_NEW,
    envId: null,
    appId: null,
    isHead: false,
    configValue: null,
    configError: false,
    value: '',
    configData: null,
    showEditValue: false,
    editLoading: false,
    initIstId: undefined,
    initIstName: undefined,
  };

  checkIstName = _.debounce((rule, value, callback) => {
    const {
      intl: { formatMessage },
      form: { isModifiedField },
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;

    const p = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (!value || !isModifiedField('instanceName')) {
      callback();
      return;
    }

    const { envId } = this.state;

    if (p.test(value)) {
      PipelineCreateStore.checkInstanceName(id, value, envId)
        .then((data) => {
          if ((data && data.failed) || !data) {
            callback(formatMessage({ id: 'checkNameExist' }));
          } else {
            callback();
          }
        })
        .catch((error) => {
          callback(formatMessage({ id: 'checkNameFail' }));
        });
    } else {
      callback(formatMessage({ id: 'formatError' }));
    }
  }, 600);

  componentDidMount() {
    const {
      stageId,
      id: taskId,
      isHead,
      intl: { formatMessage },
      form: { setFields },
    } = this.props;
    const { getTaskList, getStageList, getUser } = PipelineCreateStore;
    const { pipelineAppServiceDeployVO, type, taskUserRels } = _.find(getTaskList[stageId], ['index', taskId]) || {};
    const {
      appServiceId, envId, instanceId, valueId, instanceName,
    } = pipelineAppServiceDeployVO || {};
    this.setState({
      initIstName: instanceName,
    });

    if (instanceId) {
      this.setState({
        // initValue 可以接受undefined表示无初始值，但是不能为null
        initIstId: instanceId,
      });
    }

    if (!(type === TASK_TYPE_MANUAL)) {
      this.loadingOptionsData();
    }
    if (appServiceId && envId) {
      this.setState({ envId, appId: appServiceId });
      this.loadInstanceData(envId, appServiceId);
      this.loadConfigValue(envId, appServiceId);
    }

    valueId && this.handleChangeConfig(valueId);

    /**
     * 第一个阶段的第一个任务
     * 针对自动触发时，首个阶段的首个任务必须是部署任务
     */
    const isHeadStage = (_.head(getStageList) || {}).tempId === stageId;
    const isHeadTask = _.isEmpty(getTaskList) || (_.head(getTaskList[stageId]) || {}).index === taskId;
    if (isHeadStage && isHeadTask) {
      this.setState({ isHead: true });
    }

    const isErrorType = PipelineCreateStore.getTrigger === TRIGGER_TYPE_AUTO
      && (taskId || taskId === 0)
      && isHead
      && type === TASK_TYPE_MANUAL;
    if (isErrorType) {
      setFields({
        type: {
          value: TASK_TYPE_MANUAL,
          errors: [
            new Error(formatMessage({ id: 'pipeline.task.type.error' })),
          ],
        },
      });
    }

    // 使用这个trick，是因为当模态框还没有渲染出来，表单项就已经注册，之后就无法删除
    setTimeout(() => {
      this.setState({
        taskType: type || TASK_TYPE_DEPLOY,
        mode: instanceId ? MODE_TYPE_UPDATE : MODE_TYPE_NEW,
      });
    });
  }

  componentWillUnmount() {
    PipelineCreateStore.setAppDate([]);
    PipelineCreateStore.setEnvData([]);
    PipelineCreateStore.setInstances([]);
    PipelineCreateStore.setConfigList('');
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      form: { validateFields },
      onClose,
      stageId,
      id: taskId,
    } = this.props;

    validateFields((err, {
      type,
      name,
      appServiceId,
      triggerVersion,
      envId,
      instanceName,
      valueId,
      instanceId,
      users,
      isCountersigned,
    }) => {
      if (!err) {
        const { isHead } = this.state;
        let pipelineAppServiceDeployVO = null;
        if (type === TASK_TYPE_DEPLOY) {
          let istName = instanceName;
          if (instanceId) {
            istName = _.find(PipelineCreateStore.getInstance, ['id', instanceId]).code;
          }

          pipelineAppServiceDeployVO = {
            appServiceId,
            triggerVersion,
            envId,
            instanceId,
            instanceName: istName || null,
            valueId,
          };
        }
        const taskUserRels = type === TASK_TYPE_MANUAL ? _.map(users, (item) => item) : null;
        const data = {
          type,
          name,
          pipelineAppServiceDeployVO,
          taskUserRels,
          isCountersigned: auditMode[isCountersigned || 'orSign'],
          isHead,
        };

        if (!taskId) {
          const index = (PipelineCreateStore.getTaskIndex[stageId] || 0) + 1;
          PipelineCreateStore.setTaskIndex(stageId, index);
          PipelineCreateStore.setTaskList(stageId, { ...data, index });
        } else {
          PipelineCreateStore.updateTaskList(stageId, taskId, { ...data, index: taskId });
        }

        if (!PipelineCreateStore.getCanSubmit) {
          PipelineCreateStore.checkCanSubmit();
        }

        onClose();
      }
    });
  };

  /**
   * 切换任务类型
   * @param value
   */
  changeTaskType = (value) => {
    if (value === TASK_TYPE_DEPLOY) {
      this.loadingOptionsData();
    }

    this.props.form.setFields({
      type: {
        value,
        errors: null,
      },
    });

    this.setState({
      taskType: value,
    });
  };

  /**
   * 选择部署模式
   * @param e
   */
  handleChangeMode = (e) => {
    const { appId } = this.state;
    const mode = e.target.value;
    const app = appId ? _.find(PipelineCreateStore.getAppData, ['id', appId]) : null;
    const initIstName = app ? `${app.code}-${uuidv1().substring(0, 5)}` : uuidv1().substring(0, 30);

    this.setState({ mode, initIstName });
  };

  /**
   * 清空部属配置选择器的已选项
   */
  clearConfigFiled() {
    this.props.form.setFieldsValue({ valueId: '' });
  }

  handleChangeEnv = (id) => {
    const { appId } = this.state;

    this.setState({ envId: id }, () => this.changeAppOrEnv());
    appId && this.loadInstanceData(id, appId);
    appId && this.loadConfigValue(id, appId);
  };

  handleChangeApp = (id) => {
    const { envId } = this.state;

    this.setState({ appId: id }, () => this.changeAppOrEnv());
    envId && this.loadInstanceData(envId, id);
    envId && this.loadConfigValue(envId, id);
  };

  /**
   * 修改应用或环境
   */
  changeAppOrEnv = () => {
    const {
      stageId,
      id: taskId,
      form: { setFieldsValue, getFieldsValue },
    } = this.props;
    const { appId: selectApp, envId: selectEnv } = this.state;
    const { getTaskList } = PipelineCreateStore;
    const { pipelineAppServiceDeployVO } = _.find(getTaskList[stageId], ['index', taskId]) || {};
    const {
      appServiceId, envId, instanceId, valueId,
    } = pipelineAppServiceDeployVO || {};
    const { code } = _.find(PipelineCreateStore.getAppData, ['id', selectApp]) || {};
    const initIstName = code ? `${code}-${uuidv1().substring(0, 5)}` : uuidv1().substring(0, 30);

    if (selectApp === appServiceId && selectEnv === envId) {
      if (instanceId) {
        this.setState({
          initIstId: instanceId,
          mode: MODE_TYPE_UPDATE,
        });
      } else {
        setFieldsValue({ instanceName: initIstName });
        this.setState({ mode: MODE_TYPE_NEW });
      }
      setFieldsValue({
        valueId,
      });
      this.handleChangeConfig(valueId);
    } else {
      this.setState({
        value: '', initIstId: undefined, mode: MODE_TYPE_NEW, initIstName,
      });
      if (getFieldsValue(['instanceName'])) {
        setFieldsValue({ instanceName: initIstName });
      }
      this.clearConfigFiled();
    }
  };

  /**
   * 修改配置信息模版
   * @param value
   */
  handleChangeConfig = async (value) => {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    const configValue = await PipelineCreateStore.loadValue(id, value);
    if (configValue && configValue.value) {
      this.setState({ value: configValue.value, configData: configValue });
    } else {
      this.setState({ value: '', configData: null });
    }
  };

  /**
   * 修改配置信息内容
   * @param value
   */
  handleChangeValue = (value) => {
    this.setState({ configValue: value });
  };

  /**
   * 配置信息格式校验结果
   * @param flag
   */
  handleEnableNext = (flag) => {
    this.setState({ configError: flag });
  };

  /**
   * 获取配置信息
   */
  renderYamlEditor = () => {
    const { value } = this.state;
    const { intl: { formatMessage } } = this.props;

    return value && (
      <div>
        <div className="c7n-pipeline-config-value">
          <Icon
            className="c7n-config-tip-icon"
            type="error"
          />
          <span
            className="c7n-config-tip-text"
          >
            {formatMessage({ id: 'pipeline.config.value.tips' })}
          </span>
          <Button
            icon="mode_edit"
            type="primary"
            onClick={this.openEditValue}
          >
            <FormattedMessage id="pipeline.config.value.edit" />
          </Button>
        </div>
        <YamlEditor
          readOnly
          value={value}
        />
      </div>
    );
  };

  /**
   * 打开修改配置信息弹窗
   */
  openEditValue = () => {
    this.setState({ showEditValue: true });
  };

  /**
   * 关闭修改配置信息弹窗
   */
  closeEditValue = () => {
    this.setState({ showEditValue: false, configValue: null, configError: false });
  };

  /**
   * 修改配置信息
   */
  handleEditValue = () => {
    const { configValue, configData } = this.state;
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    this.setState({ editLoading: true });
    configData.value = configValue;
    PipelineCreateStore.editConfigValue(id, configData)
      .then((data) => {
        this.setState({ editLoading: false });
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handleChangeConfig(configData.id);
          this.closeEditValue();
        }
      })
      .catch((err) => {
        this.setState({ editLoading: false });
        Choerodon.handleResponseError(err);
      });
  };

  loadingOptionsData() {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    PipelineCreateStore.loadEnvData(id);
    PipelineCreateStore.loadAppData(id);
  }

  loadInstanceData(envId, appId) {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    PipelineCreateStore.loadInstances(id, envId, appId);
  }

  /**
   * 加载部署配置信息
   * @param envId
   * @param appId
   */
  loadConfigValue(envId, appId) {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    PipelineCreateStore.loadConfig(id, envId, appId);
  }

  loadMoreWrap = (e) => {
    e.stopPropagation();
    const {
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    const {
      getPageInfo,
    } = PipelineCreateStore;
    const { pageNum } = getPageInfo || {};
    PipelineCreateStore.loadUser(projectId, pageNum + 1);
  };

  handleSearch = _.debounce((value) => {
    const {
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    PipelineCreateStore.loadUser(projectId, 1, value);
  }, 700);

  handleUserChange = (value) => {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (_.includes(value, 'pipeline-create-user-select-more-key')) {
      const realValue = _.remove(value, (item) => item === 'pipeline-create-user-select-more-key');
      setFieldsValue({ users: realValue });
    }
  };

  render() {
    const {
      visible,
      onClose,
      form: { getFieldDecorator, getFieldValue },
      intl: { formatMessage },
      stageId,
      stageName,
      id: taskId,
      AppState: {
        currentMenuType: {
          id: projectId,
          type: menuType,
          name: projectName,
          organizationId,
        },
      },
    } = this.props;
    const {
      getEnvData,
      getAppData,
      getLoading,
      getInstance,
      getTaskList,
      getConfigList,
      getUser,
      getTaskSettings,
      getTrigger,
      getPageInfo,
    } = PipelineCreateStore;
    const {
      submitting,
      taskType,
      mode,
      isHead,
      appId,
      envId: selectEnvId,
      showEditValue,
      editLoading,
      value,
      configData,
      configError,
      initIstId,
      initIstName,
    } = this.state;

    const {
      pipelineAppServiceDeployVO, type, name: taskName, isCountersigned, taskUserRels,
    } = _.find(getTaskList[stageId], ['index', taskId]) || {};
    const {
      instanceId, appServiceId, triggerVersion, envId, valueId,
    } = pipelineAppServiceDeployVO || {};
    /** ********* 生成选择器的选项 ********* */
    const appOptions = _.map(getAppData, ({ id, name }) => (
      <Option key={id} value={id}>
        {name}
      </Option>
    ));

    const envOptions = _.map(getEnvData, ({
      id, connect, permission, name, synchro, active,
    }) => (
      <Option
        key={id}
        value={id}
        disabled={!connect || !synchro || !permission}
        title={name}
      >
        <StatusDot
          connect={connect}
          synchronize={synchro}
          active={active}
          size="small"
        />
        <span className="c7ncd-pipeline-create-env">{name}</span>
      </Option>
    ));

    const instanceOptions = _.map(getInstance, ({ id, code }) => (<Option value={id} key={id}>{code}</Option>));

    const userOptions = _.map(getUser, ({ id, realName, loginName }) => (
      <Option key={id} value={String(id)}>
        <Tooltip title={loginName}>{realName || loginName}</Tooltip>
      </Option>
    ));

    if (getPageInfo && getPageInfo.hasNextPage) {
      userOptions.push(<Option key="pipeline-create-user-select-more-key" className="c7n-load-more-wrap">
        <div
          className="c7n-option-popover"
          onClick={this.loadMoreWrap}
        >
          <span className="c7n-option-span">{formatMessage({ id: 'loadMore' })}</span>
        </div>
      </Option>);
    }

    const configOptions = _.map(getConfigList, ({ id, name }) => (
      <Option key={id} value={id}>
        {name}
      </Option>
    ));
    /** ********** end ************** */

    const initUsers = _.map(taskUserRels, (item) => String(item));
    let initSign;
    if (typeof isCountersigned === 'number') {
      initSign = isCountersigned ? AUDIT_MODE_SING : AUDIT_MODE_ORSING;
    }

    /**
     * 不可以选择人工卡点情况：
     * 1. 阶段任务为并行执行
     * 2. 流水线触发方式为自动触发时，第一个阶段的第一个任务
     * @type {*|boolean}
     */
    const disableChooseManual = (getTaskSettings[stageId] && getTaskSettings[stageId] === String(TASK_PARALLEL))
      || (getTrigger === STAGE_FLOW_AUTO && isHead);
    const isEdit = taskId || taskId === 0;

    const deployFields = taskType === TASK_TYPE_DEPLOY
      ? (
        <>
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('appServiceId', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'required' }),
                },
              ],
              initialValue: appOptions.length ? appServiceId : undefined,
            })(
              <Select
                label={formatMessage({ id: 'appService' })}
                optionFilterProp="children"
                onChange={this.handleChangeApp}
                loading={getLoading.app}
                filter
                filterOption={(input, option) => option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0}
              >
                {appOptions}
              </Select>,
            )}
          </FormItem>
          <div className="c7ncd-sidebar-select pipeline-type-tips">
            <FormItem
              className="c7ncd-select_has-tips"
              {...formItemLayout}
            >
              {getFieldDecorator('triggerVersion', {
                initialValue: triggerVersion ? triggerVersion.slice() : undefined,
              })(
                <Select
                  mode="tags"
                  label={formatMessage({ id: 'pipeline.task.version' })}
                  allowClear
                >
                  {_.map(VERSION_TYPE, (item) => (
                    <Option key={item} value={item}>{item}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <Tips type="form" data="pipeline.task.version.tips" />
          </div>
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('envId', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'required' }),
                },
              ],
              initialValue: envOptions.length ? envId : undefined,
            })(
              <Select
                label={formatMessage({ id: 'envName' })}
                optionFilterProp="children"
                onChange={this.handleChangeEnv}
                loading={getLoading.env}
                filter
                filterOption={(input, option) => option.props.children[1]
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0}
              >
                {envOptions}
              </Select>,
            )}
          </FormItem>
          <>
            <div className="c7n-pipeline-config">
              <Tips type="title" data="pipeline.deploy.mode" />
            </div>
            <RadioGroup
              onChange={this.handleChangeMode}
              value={mode}
              className="c7n-pipeline-radio"
            >
              <Radio
                disabled={instanceId && selectEnvId === envId && appId === appServiceId}
                value={MODE_TYPE_NEW}
              >
                <FormattedMessage id="pipeline.task.instance.create" />
              </Radio>
              <Radio
                disabled={!(getInstance && getInstance.length)}
                value={MODE_TYPE_UPDATE}
              >
                <FormattedMessage id="pipeline.task.instance.update" />
                <Icon
                  className="c7n-pipeline-replace-tip-icon"
                  type="error"
                />
                <span
                  className="c7n-pipeline-replace-tip-text"
                >
                  {formatMessage({ id: 'pipeline.task.instance.tips' })}
                </span>
              </Radio>
            </RadioGroup>
          </>
          {mode === MODE_TYPE_NEW && (
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('instanceName', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'required' }),
                },
                {
                  validator: this.checkIstName,
                },
              ],
              initialValue: initIstName,
            })(
              <Input
                disabled={mode !== MODE_TYPE_NEW}
                maxLength={30}
                label={formatMessage({ id: 'pipeline.task.instance' })}
              />,
            )}
          </FormItem>
          )}
          {mode === MODE_TYPE_UPDATE && (
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('instanceId', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'required' }),
                },
              ],
              initialValue: instanceOptions.length ? initIstId : undefined,
            })(
              <Select
                filter
                optionFilterProp="children"
                label={formatMessage({ id: 'pipeline.task.instance.replace' })}
                filterOption={(input, option) => option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0}
              >
                {instanceOptions}
              </Select>,
            )}
          </FormItem>
          )}
          <div className="c7n-pipeline-config">
            <Tips type="title" data="pipeline.task.config.title" />
          </div>
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('valueId', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'required' }),
                },
              ],
              initialValue: configOptions.length ? valueId : undefined,
            })(
              <Select
                disabled={!(getFieldValue('appServiceId') && getFieldValue('envId'))}
                label={formatMessage({ id: 'pipeline.task.config' })}
                optionFilterProp="children"
                onChange={this.handleChangeConfig}
                loading={getLoading.config}
                filter
                filterOption={(input, option) => option.props.children.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0}
                dropdownClassName="c7n-pipeline-config-select"
              >
                {configOptions}
              </Select>,
            )}
          </FormItem>
        </>
      )
      : null;
    const manualFields = taskType === TASK_TYPE_MANUAL
      ? (
        <>
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('users', {
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
              initialValue: userOptions.length ? initUsers : undefined,
            })(
              <Select
                filter
                filterOption={false}
                loading={getLoading.user}
                allowClear
                mode="multiple"
                optionFilterProp="children"
                className="c7n-select_512"
                label={<FormattedMessage id="pipeline.task.auditor" />}
                onSearch={this.handleSearch}
                onChange={this.handleUserChange}
              >
                {userOptions}
              </Select>,
            )}
          </FormItem>
          {getFieldValue('users') && getFieldValue('users').length > 1 && (
          <div className="c7ncd-sidebar-select pipeline-type-tips">
            <FormItem
              className="c7ncd-select_has-tips"
              {...formItemLayout}
            >
              {getFieldDecorator('isCountersigned', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
                initialValue: initSign,
              })(
                <Select
                  className="c7n-select_512"
                  label={<FormattedMessage id="pipeline.task.auditMode" />}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value={AUDIT_MODE_SING} title={formatMessage({ id: 'pipeline.audit.sign' })}>
            {formatMessage({ id: 'pipeline.audit.sign' })}
          </Option>
                  <Option value={AUDIT_MODE_ORSING} title={formatMessage({ id: 'pipeline.audit.orSign' })}>
            {formatMessage({ id: 'pipeline.audit.orSign' })}
          </Option>
                </Select>,
              )}
            </FormItem>
            <Tips type="form" data="pipeline.task.auditMode.tips" />
          </div>
          )}
        </>
      )
      : null;

    return (
      <>
        <Sidebar
          destroyOnClose
          title={<FormattedMessage id={`pipeline.task.${isEdit ? 'edit' : 'create'}.head`} />}
          visible={visible}
          width={740}
          onOk={this.handleSubmit}
          onCancel={onClose}
          okText={formatMessage({ id: isEdit ? 'save' : 'add' })}
        >
          <Content
            className="sidebar-content c7n-pipeline-task-create"
          >
            <Form layout="vertical">
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('type', {
                  initialValue: type || TASK_TYPE_DEPLOY,
                })(
                  <Select
              label={formatMessage({ id: 'pipeline.task.type' })}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              onChange={this.changeTaskType}
            >
              <Option value={TASK_TYPE_DEPLOY} title={formatMessage({ id: 'pipeline.mode.auto' })}>
                    {formatMessage({ id: 'pipeline.mode.auto' })}
                  </Option>
              <Option
                    // 并行任务不可以选择人工卡点
                    disabled={disableChooseManual}
                    value={TASK_TYPE_MANUAL}
                    title={formatMessage({ id: 'pipeline.mode.manual' })}
                  >
                    <Tooltip
                      title={disableChooseManual
                        ? (
                          <div className="c7n-pipeline-task-parallel-disabled">
                            <FormattedMessage id="pipeline.task.parallel.disabled-1" />
                            <FormattedMessage id="pipeline.task.parallel.disabled-2" />
                          </div>
                        )
                        : ''}
                      placement="right"
                    >
                      <span><FormattedMessage id="pipeline.mode.manual" /></span>
                    </Tooltip>
                  </Option>
            </Select>,
                )}
              </FormItem>
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                      whitespace: true,
                    },
                  ],
                  initialValue: taskName,
                })(
                  <Input
              maxLength={30}
              type="text"
              label={<FormattedMessage id="pipeline.task.name" />}
            />,
                )}
              </FormItem>
              {deployFields}
              {manualFields}
            </Form>
            {taskType === TASK_TYPE_DEPLOY && (getLoading.value ? <Spin /> : this.renderYamlEditor())}
          </Content>
        </Sidebar>
        {showEditValue && (
        <Modal
          confirmLoading={editLoading}
          visible={showEditValue}
          title={`${formatMessage({ id: 'pipeline.config.edit.title' }, { name: configData.name })}`}
          className="c7n-config-value-modal"
          closable={false}
          onOk={this.handleEditValue}
          onCancel={this.closeEditValue}
          disableOk={configError}
          okText={formatMessage({ id: 'boot.edit' })}
        >
          <div className="c7n-config-value-modal-content">
            <YamlEditor
              readOnly={false}
              value={value}
              originValue={value}
              onValueChange={this.handleChangeValue}
              handleEnableNext={this.handleEnableNext}
            />
          </div>
        </Modal>
        )}
      </>
    );
  }
}
