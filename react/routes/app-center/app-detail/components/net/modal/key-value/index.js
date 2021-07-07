/* eslint-disable */
import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { Choerodon } from '@choerodon/boot';
import { Button, Form, Input, Modal, Icon, Table, Tooltip } from 'choerodon-ui';
import { EditableCell, EditableFormRow } from './editableTable';
import { objToYaml, yamlToObj, takeObject, ConfigNode, makePostData } from '../utils';
import YamlEditor from '../../../../../../../components/yamlEditor';
import { handlePromptError } from '../../../../../../../utils';

import '../../../../../../main.less';
import './index.less';

const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { TextArea } = Input;

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

@Form.create({})
@injectIntl
@inject('AppState')
@observer
export default class FormView extends Component {
  static defaultProps = {
    modeSwitch: false,
  };

  state = {
    // 键值对格式
    dataSource: [new ConfigNode()],
    // yaml 格式
    dataYaml: '',
    counter: 1,
    submitting: false,
    hasItemError: false,
    warningMes: '',
    data: false,
    isYamlEdit: false,
    hasYamlError: false,
    // yaml格式的value只能是字符串或null
    hasValueError: false,
    valueErrorMsg: '',
  };

  /**
   * 检查名称唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = _.debounce((rule, value, callback) => {
    const {
      intl: {
        formatMessage,
      },
      AppState: {
        currentMenuType: {
          projectId,
        },
      },
      envId,
      store,
    } = this.props;

    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && !pattern.test(value)) {
      callback(formatMessage({ id: 'network.name.check.failed' }));
    } else if (value && pattern.test(value)) {
      store.checkName(projectId, envId, value)
        .then(res => {
          if (handlePromptError(res, false)) {
            callback();
          } else {
            callback(formatMessage({ id: 'checkNameExist' }));
          }
        })
        .catch(error => {
          callback(formatMessage({ id: 'checkNameFailed' }));

        });
    } else {
      callback();
    }
  }, 1000);

  async componentDidMount() {
    const {
      id,
      store,
      AppState: {
        currentMenuType: {
          projectId,
        },
      },
      modal,
    } = this.props;
    if (id) {
      try {
        const res = await store.loadSingleData(projectId, id);
        if (handlePromptError(res)) {
          let counter = 1;

          if (!_.isEmpty(res.value)) {
            const dataSource = _.map(res.value, (value, key) => new ConfigNode(key, value, counter++));

            this.setState({
              dataSource,
              counter,
            });
          }

          this.setState({ data: res });
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    }
    modal.handleOk(this.handleSubmit);
  }

  /**
   * 删除key-value
   * @param key
   */
  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource].filter(item => item.index !== key);

    this.asyncCheckErrorData(dataSource);

    this.setState({ dataSource });
  };

  /**
   * 添加一组 key/value
   * @param data
   */
  handleAdd = (data) => {
    const { counter, dataSource } = this.state;

    let _data = data;

    if (!Array.isArray(data)) {
      _data = [[null, null]];
    }

    let _counter = counter;
    const newData = _.map(_data, ([key, value]) => new ConfigNode(key, value, ++_counter));

    if (!newData.length) {
      const initConfig = new ConfigNode();
      newData.push(initConfig);
    }

    const uniqData = _.uniqBy([...dataSource.filter(item => item.index !== ''), ...newData], 'index');
    this.setState({
      dataSource: uniqData,
      counter: _counter,
    });
  };

  /**
   * 保存输入
   * @param row
   */
  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = _.findIndex(newData, ['index', row.index]);

    newData.splice(index, 1, {
      ...newData[index],
      ...row,
    });

    this.checkErrorData(newData);

    this.setState({ dataSource: newData });
  };

  /**
   * configMap 规则中value只能是字符串
   * @param data
   */
  checkConfigRuleError = (data = '') => {
    const yaml = data || this.state.dataYaml;
    const yamlObj = yamlToObj(yaml) || {};
    const values = Object.values(yamlObj);

    let error = false;
    for (let i = 0, len = values.length; i < len; i++) {
      if (typeof values[i] !== 'string' || values[i] === '') {
        error = true;
        break;
      }
    }

    this.setState({ hasValueError: error }, () => this.checkButtonDisabled);
    return error;
  };

  asyncCheckConfigRuleError = _.debounce(this.checkConfigRuleError, 600);

  /**
   * 同步校验键值对
   * @param data
   * @returns {boolean}
   */
  checkErrorData = (data = null, isSubmit = false) => {
    const {
      title,
      intl: {
        formatMessage,
      },
      modal,
    } = this.props;

    const _data = data || this.state.dataSource;
    const hasKey = _data.filter(({ key }) => !_.isEmpty(key));
    const onlyHasValue = _data.filter(({ key, value }) => _.isEmpty(key) && !_.isEmpty(value));
    const onlyHasKey = hasKey.filter(({ value }) => _.isEmpty(value));
    const hasErrorItem = onlyHasKey.length || onlyHasValue.length;
    const hasRepeatKey = hasKey.length !== _.uniqBy(hasKey, 'key').length;
    const hasEmptyKey = title === 'cipher' && (_.isEmpty(hasKey) || hasKey.length !== _data.length);

    let hasErrorKey;
    for (const { key } of hasKey) {
      const pattern = /[^0-9A-Za-z\.\-\_]/;
      if (pattern.test(key)) {
        hasErrorKey = true;
        break;
      }
    }

    if (!(hasErrorItem || hasErrorKey || hasRepeatKey || hasEmptyKey)) {
      this.setState({
        warningMes: '',
        hasItemError: false,
      }, () => this.checkButtonDisabled(isSubmit));
      return false;
    }

    const errorMsg = formatMessage({
      id: hasRepeatKey ? 'configMap.keyRepeat' : `${title}.keyValueSpan`,
    });

    this.setConfigError(errorMsg);

    return true;
  };

  /**
   * 校验键值对
   * @param data
   * @returns {boolean}
   */
  asyncCheckErrorData = _.debounce(this.checkErrorData, 500);

  /**
   * 设置键值对模式下的错误提示
   * @param msg
   */
  setConfigError(msg) {
    const { modal } = this.props;
    this.setState({
      warningMes: msg,
      hasItemError: true,
    });
    modal.update({ okProps: { disabled: true }});
  }

  formValidate = () => {
    const {
      id,
      envId,
      appId,
      form: { validateFields },
    } = this.props;
    const {
      dataSource,
      isYamlEdit,
      hasYamlError,
      dataYaml,
    } = this.state;

    let configData = [];
    let hasKVError = false;
    let hasConfigRuleError = false;

    return new Promise((resolve) => {
      validateFields((err, { name, description }) => {
        if (!isYamlEdit) {
          hasKVError = this.checkErrorData(null, true);
          const allData = [...dataSource.filter(item => !_.isEmpty(item.key))];
          configData = _.uniqBy(allData, 'index');
        } else {
          hasConfigRuleError = this.checkConfigRuleError();
          configData = yamlToObj(dataYaml);
        }

        if (hasYamlError || hasKVError || hasConfigRuleError) {
          resolve(false);
        } else {
          this.setState({
            submitting: true,
            hasItemError: false,
          });

          if (!err) {
            const _value = takeObject(configData);
            const dto = {
              name,
              description,
              envId,
              appServiceId: appId,
              type: id ? 'update' : 'create',
              id: id || undefined,
              value: _value,
            };
            resolve(dto);
          }
          resolve(false);
        }
      });
    });
  };

  /**
   * form提交函数
   * 添加粘贴后key-value校验
   * @param e
   */
  handleSubmit = async () => {
    const {
      store,
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
      refresh,
    } = this.props;
    const postData = await this.formValidate();

    if (!postData) {
      return false;
    }
    try {
      const res = await store.postKV(projectId, postData);
      if (handlePromptError(res)) {
        refresh();
      } else {
        return false;
      }
    } catch (error) {
      Choerodon.handleResponseError(error);
      return false;
    }
  };

  /**
   * 配置信息的名称描述等常规表单项
   * @returns {*}
   */
  getFormContent = () => {
    const {
      intl: { formatMessage },
      form: { getFieldDecorator },
      id,
      title,
    } = this.props;
    const { data } = this.state;
    return (<Form className='c7n-sidebar-form' layout="vertical">
      <FormItem
        {...formItemLayout}
      >
        {getFieldDecorator('name', {
          initialValue: data ? data.name : null,
          rules: [{
            required: true,
            message: formatMessage({ id: 'required' }),
          }, {
            validator: id ? null : this.checkName,
          }],
        })(
          <Input
            autoFocus={!id}
            disabled={!!id}
            maxLength={100}
            label={<FormattedMessage id="app.name" />}
          />,
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
      >
        {getFieldDecorator('description', {
          initialValue: data ? data.description : null,
        })(
          <TextArea
            autoFocus={!!id}
            autosize={{ minRows: 2 }}
            maxLength={30}
            label={<FormattedMessage id="configMap.des" />}
          />,
        )}
      </FormItem>
    </Form>);
  };

  /**
   * 编辑 configMap 组件节点
   * 有两种模式：key/value编辑模式、YAML代码编辑模式
   * @returns {*}
   */
  getConfigMap = () => {
    const { title, intlPrefix } = this.props;
    const {
      dataSource,
      isYamlEdit,
      hasItemError,
      warningMes,
      dataYaml,
      hasValueError,
      valueErrorMsg,
    } = this.state;

    let configMap = null;
    if (!isYamlEdit) {
      const components = {
        body: {
          row: EditableFormRow,
          cell: EditableCell,
        },
      };
      const baseColumns = [{
        title: 'key',
        dataIndex: 'key',
        width: '25%',
        editable: true,
      }, {
        title: '',
        width: '5%',
        className: 'icon-equal',
        align: 'center',
        dataIndex: 'temp',
      }, {
        title,
        width: '100%',
        dataIndex: 'value',
        editable: true,
      }, {
        title: '',
        dataIndex: 'operation',
        render: (text, { index }) => (
          dataSource.length >= 1 ? (
            <Icon
              className="del-btn"
              type="delete"
              onClick={this.handleDelete.bind(this, index)}
            />
          ) : null),
      }];

      const columns = baseColumns.map((col) => {
        if (!col.editable) return col;

        return {
          ...col,
          onCell: record => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            save: this.handleSave,
            add: this.handleAdd,
          }),
        };
      });

      configMap = <Fragment>
        <Table
          filterBar={false}
          showHeader={false}
          pagination={false}
          components={components}
          className="c7n-editable-table"
          dataSource={dataSource}
          columns={columns}
          rowKey={record => record.index}
        />
        <Button icon="add" onClick={this.handleAdd} type="primary">
          <FormattedMessage id={`${intlPrefix}.${title}.add`} />
        </Button>
        {hasItemError ? <div className="c7n-cm-warning">{warningMes}</div> : null}
      </Fragment>;
    } else {
      configMap = <Fragment>
        <YamlEditor
          readOnly={false}
          modeChange={false}
          value={dataYaml}
          onValueChange={this.changeYamlValue}
          handleEnableNext={this.checkYamlError}
        />
        <div className="c7ncd-config-yaml-tip">{hasValueError && (valueErrorMsg
          || <FormattedMessage id="configMap.yaml.error" />)}</div>
      </Fragment>;
    }

    return configMap;
  };

  /**
   * yaml 值改变
   * @param value
   */
  changeYamlValue = (value) => {
    this.asyncCheckConfigRuleError(value);

    this.setState({ dataYaml: value });
  };

  /**
   * 校验yaml格式
   * @param flag
   */
  checkYamlError = (flag) => {
    this.setState({ hasYamlError: flag }, () => this.checkButtonDisabled());
  };

  /**
   * 切换配置映射的编辑模式
   */
  changeEditMode = () => {
    const {
      dataSource,
      dataYaml,
      hasYamlError,
      isYamlEdit,
      hasValueError,
      hasItemError,
    } = this.state;
    const { modal } = this.props;

    if (hasYamlError || hasValueError || hasItemError) return;

    if (!isYamlEdit) {
      const result = this.checkErrorData(dataSource);

      if (result) return;

      const yamlValue = objToYaml(dataSource);

      this.checkConfigRuleError(yamlValue);

      this.setState({
        counter: 1,
        hasItemError: false,
        isYamlEdit: true,
        warningMes: '',
        dataSource: [],
        dataYaml: yamlValue,
      }, () => this.checkButtonDisabled());
    } else {
      const result = this.checkConfigRuleError(dataYaml);

      if (result) return;

      try {
        const kvValue = yamlToObj(dataYaml);
        const postData = makePostData(kvValue);

        const counter = postData.length;
        this.setState({
          dataSource: postData,
          hasYamlError: false,
          isYamlEdit: false,
          dataYaml: '',
          counter,
        }, () => this.checkButtonDisabled());
      } catch (e) {
        this.setState({
          hasValueError: true,
          valueErrorMsg: e.message,
        });
        modal.update({ okProps: { disabled: true }})
      }
    }
  };

  checkButtonDisabled = (isSubmit = false) => {
    const { modal } = this.props;
    const {
      hasYamlError,
      hasValueError,
      hasItemError,
    } = this.state;
    !isSubmit && modal.update({ okProps: { disabled: hasYamlError || hasValueError || hasItemError }})
  };

  render() {
    const {
      intl: { formatMessage },
      visible,
      id,
      title,
      modeSwitch,
      AppState: {
        currentMenuType: {
          name: menuName,
        },
      },
      intlPrefix,
    } = this.props;
    const {
      submitting,
      data,
      hasYamlError,
      isYamlEdit,
      hasValueError,
      hasItemError,
    } = this.state;

    const titleName = id ? data.name : menuName;
    const titleCode = `${intlPrefix}.${title}.${id ? 'edit' : 'create'}`;
    const disableBtn = hasYamlError || hasValueError || hasItemError;

    return (
      <div className="c7n-region">
        <div>
          {this.getFormContent()}
          <div className="c7n-sidebar-from-title">
            <FormattedMessage id={`${intlPrefix}.${title}.head`} />
            {!isYamlEdit && <Tooltip
              overlayStyle={{ maxWidth: 350 }}
              title={formatMessage({ id: `${intlPrefix}.${title}.help.tooltip` })}
            >
              <Icon type="help" />
            </Tooltip>}
            {modeSwitch ? <Button
              className="c7n-config-mode-btn"
              type="primary"
              funcType="flat"
              disabled={disableBtn}
              onClick={this.changeEditMode}
            >
              <FormattedMessage id={isYamlEdit ? 'configMap.mode.yaml' : 'configMap.mode.kv'} />
            </Button> : null}
          </div>
          <div className="c7n-config-editor">
            {this.getConfigMap()}
          </div>
        </div>
      </div>
    );
  }
}
