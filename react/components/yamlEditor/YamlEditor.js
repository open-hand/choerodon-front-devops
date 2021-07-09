import React, { Component, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Icon } from 'choerodon-ui';
import classnames from 'classnames';
import { checkFormat, changedValue } from './utils';
import 'codemirror/addon/merge/merge.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import './theme-chd.css';
import CodeMirror from './editor/CodeMirror';
import 'codemirror/addon/lint/lint.js';
import './index.less';
import './yaml-lint';
import './yaml-mode';
import './merge';

const HAS_ERROR = true;
const NO_ERROR = false;
const MoreDocumentErrorReason = 'expected a single document in the stream, but found more';

@injectIntl
export default class YamlEditor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    readOnly: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    originValue: PropTypes.string,
    handleEnableNext: PropTypes.func,
    onValueChange: PropTypes.func,
    modeChange: PropTypes.bool,
    showError: PropTypes.bool,
    className: PropTypes.string,
    showMoreDocumentErrorTips: PropTypes.string,
  };

  static defaultProps = {
    readOnly: true,
    originValue: '',
    modeChange: true,
    showError: true,
    handleEnableNext: () => {
    },
    onValueChange: () => {
    },
    showMoreDocumentErrorTips: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      errorTip: false,
      moreDocumentErrorTip: false,
    };
    this.options = {
      // chd 自定制的主题配色
      theme: 'chd',
      mode: 'text/chd-yaml',
      readOnly: props.readOnly,
      lineNumbers: !props.readOnly,
      lineWrapping: true,
      viewportMargin: Infinity,
      lint: !props.readOnly && props.showError,
      gutters: !props.readOnly ? ['CodeMirror-lint-markers'] : [],
    };
  }

  componentDidMount() {
    const { value, onValueChange } = this.props;
    this.checkYamlFormat(value);
    // 初始化组件时设置值
    onValueChange(value);
  }

  onChange = (value) => {
    const { onValueChange, originValue, handleEnableNext } = this.props;
    const hasError = this.checkYamlFormat(value);
    let changed = false;
    if (!hasError) {
      changed = changedValue(originValue, value, (flag) => {
        this.setState({ errorTip: flag });
        handleEnableNext(flag);
      });
    }
    onValueChange(value, changed);
  };

  /**
   * 校验Yaml格式
   * 校验规则来源 https://github.com/nodeca/js-yaml
   * @param {*} values
   */
  checkYamlFormat(values) {
    const { handleEnableNext, showMoreDocumentErrorTips } = this.props;

    let errorTip = NO_ERROR;
    let moreDocumentErrorTip = NO_ERROR;
    // yaml 格式校验结果
    const formatResult = checkFormat(values);
    if (formatResult && formatResult.length) {
      if (showMoreDocumentErrorTips
        && formatResult.some((item) => item?.reason && item?.reason === MoreDocumentErrorReason)
      ) {
        moreDocumentErrorTip = HAS_ERROR;
      }
      errorTip = HAS_ERROR;
      handleEnableNext(HAS_ERROR);
    } else {
      errorTip = NO_ERROR;
      handleEnableNext(NO_ERROR);
    }

    // 显示编辑器下方的错误 tips
    this.setState({ errorTip, moreDocumentErrorTip });
    return errorTip;
  }

  render() {
    // originValue 用做merge对比的源数据
    const {
      intl: { formatMessage },
      originValue,
      value,
      modeChange,
      readOnly,
      showError,
      className,
      showMoreDocumentErrorTips,
    } = this.props;
    const { errorTip, moreDocumentErrorTip } = this.state;

    const wrapClass = classnames({
      'c7ncd-yaml-wrapper': true,
      'c7ncd-yaml-readonly': readOnly,
      [className]: true,
    });

    return (
      <>
        <div className={wrapClass}>
          <CodeMirror
            modeChange={modeChange}
            options={this.options}
            value={value || ''}
            originValue={originValue}
            onChange={this.onChange}
            ref={(instance) => {
              this.yamlEditor = instance;
            }}
          />
        </div>
        {showError && errorTip ? (
          <div className="c7ncd-yaml-error">
            <Icon type="error" className="c7ncd-yaml-error-icon" />
            <span className="c7ncd-yaml-error-msg">
              {formatMessage({
                id: showMoreDocumentErrorTips && moreDocumentErrorTip
                  ? 'yaml.error.tooltip.moreDocument'
                  : 'yaml.error.tooltip',
              })}
            </span>
          </div>
        ) : null}
      </>
    );
  }
}
