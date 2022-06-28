/* eslint-disable no-underscore-dangle */

import React, { Component } from 'react';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Modal, Select, message } from 'choerodon-ui';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { Content } from '@choerodon/master';
import ReactCodeMirror from 'react-codemirror';
import uuidv1 from 'uuid';
import Cookies from 'universal-cookie';
import { saveAs } from 'file-saver';
import { removeEndsChar } from '../../utils';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import './index.less';

const LOG_OPTIONS = {
  readOnly: true,
  lineNumbers: true,
  lineWrapping: true,
  autofocus: true,
  theme: 'material-darker',
};
const { Sidebar } = Modal;
const { Option } = Select;

const cookies = new Cookies();
const getAccessToken = () => cookies.get('access_token');

@inject('AppState')
@injectIntl
@observer
export default class LogSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      following: true,
      fullScreen: false,
      containerName: '',
      logId: null,
      isDownload: false,
      isRestartDownload: false,
      logList: [],
    };
    this.timer = null;
    this.socket = null;
  }

  componentDidMount() {
    const that = this;
    const { record: { containers, containerIndex } } = this.props;
    const { name, logId } = containers[containerIndex || 0];
    this.setState({ containerName: name, logId });
    console.log('didmount loadlog');
    setTimeout(() => this.loadLog(false, that), 500);
    document.onfullscreenchange = function (event) {
      const isFullScreen = document.fullscreenElement;
      that.setState({
        fullScreen: Boolean(isFullScreen),
      });
    };
  }

  componentWillUnmount() {
    this.clearLogAndTimer();
  }

  handleChange = (value) => {
    const that = this;
    const [logId, containerName] = value.split('+');
    // eslint-disable-next-line react/destructuring-assignment
    if (logId !== this.state.logId) {
      this.setState({
        containerName,
        logId,
      });
      this.clearLogAndTimer();
      console.log('change loadlog');
      setTimeout(() => this.loadLog(false, that), 500);
    }
  };

  /**
   * 清除定时器和websocket连接
   */
  clearLogAndTimer = () => {
    clearInterval(this.timer);
    this.timer = null;
    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;
  };

  /**
   * 日志go top
   */
  goTop = () => {
    const element = document.querySelector('.c7n-log-editor');
    element.scrollTop = 0;
  };

  /**
   * top log following
   */
  // TODO
  stopFollowing = () => {
    console.log('stopfollowing');
    if (this.socket) {
      this.socket.close();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setState({
      following: false,
    });
  };

  /**
   *  全屏查看日志
   */
  setFullScreen = () => {
    const cm = document.querySelector('.c7n-term-wrap');
    // const wrap = cm.getWrapperElement();
    // cm.state.fullScreenRestore = {
    //   scrollTop: window.pageYOffset,
    //   scrollLeft: window.pageXOffset,
    //   width: wrap.style.width,
    //   height: wrap.style.height,
    // };
    // wrap.style.width = '';
    // wrap.style.height = 'auto';
    // wrap.className += ' CodeMirror-fullScreen';
    this.setState({ fullScreen: true });
    if (cm.requestFullscreen) {
      cm.requestFullscreen();
    } else if (cm.mozRequestFullScreen) {
      cm.mozRequestFullScreen();
    } else if (cm.webkitRequestFullScreen) {
      cm.webkitRequestFullScreen();
    }
    // document.documentElement.style.overflow = 'hidden';
    // cm.refresh();
    // window.addEventListener('keydown', (e) => {
    //   debugger;
    //   console.log(e);
    //   this.setNormal(e.which);
    // });
  };

  /**
   * 任意键退出全屏查看
   */
  setNormal = () => {
    if (this.editorLog) {
      const cm = this.editorLog.getCodeMirror();
      const wrap = cm.getWrapperElement();
      wrap.className = wrap.className.replace(/\s*CodeMirror-fullScreen\b/, '');
      document.documentElement.style.overflow = '';
      const info = cm.state.fullScreenRestore;
      wrap.style.width = info.width;
      wrap.style.height = info.height;
      window.scrollTo(info.scrollLeft, info.scrollTop);
      cm.refresh();
    }
    this.setState({ fullScreen: false });
    // window.removeEventListener('keydown', (e) => {
    //   this.setNormal(e.which);
    // });
  };

  /**
   * 加载日志
   */
  loadLog = (isFollow = true, that) => {
    const {
      record, clusterId: propsClusterId, projectId: propsProjectId,
      AppState: { currentMenuType: { projectId: currentProjectId } },
    } = this.props;
    const { namespace, name, podName: recordPodName } = record || {};
    const clusterId = propsClusterId || record?.clusterId;
    const projectId = propsProjectId || currentProjectId || record?.projectId;
    const podName = name || recordPodName;
    const { logId, containerName, following } = this.state;
    const wsUrl = removeEndsChar(window._env_.DEVOPS_HOST, '/');
    const secretKey = window._env_.DEVOPS_WEBSOCKET_SECRET_KEY;
    const key = `cluster:${clusterId}.log:${uuidv1()}`;
    const url = `${wsUrl}/websocket?key=${key}&group=from_front:${key}&processor=front_log&secret_key=${secretKey}&env=${namespace}&podName=${podName}&containerName=${containerName}&logId=${logId}&clusterId=${clusterId}&oauthToken=${getAccessToken()}&projectId=${projectId}`;
    let logs = [];

    try {
      const ws = new WebSocket(url);
      this.setState({ following: true });
      if (!isFollow) {
        console.log('!isFollow');
        logs = ['<span>1</span>Loading...\n'];
        this.setState({
          logList: logs,
        });
      }
      ws.onopen = () => {
        console.log('open');
        logs = ['<span>1</span>Loading...\n'];
        this.setState({
          logList: logs,
        });
      };
      ws.onerror = (e) => {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        console.log('error');
        logs.push(`<span>${logs.length}</span>连接出错，请重新打开\n`);
        this.setState({
          logList: logs,
        });
        // editor.setValue(_.join(logs, ''));
        // editor.execCommand('goDocEnd');
      };

      ws.onclose = () => {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        if (following) {
          console.log('follow');
          logs.push(`<span>${logs.length}</span>连接已断开\n`);
          this.setState({
            logList: logs,
          });
        }
        // editor.execCommand('goDocEnd');
        // setTimeout(() => {
        //  this.loadLog(false);
        // }, 1000);
      };

      ws.onmessage = (e) => {
        if (e.data.size) {
          const reader = new FileReader();
          reader.readAsText(e.data, 'utf-8');
          reader.onload = () => {
            if (reader.result !== '') {
              const originLength = logs.length;
              logs = [
                ...logs,
                ...reader.result.split('\n').map((item, index) => `<span>${originLength + index}</span>${item}`),
              ];
              console.log('onMessage');
              this.setState({
                logList: logs,
              }, () => {
                this.scrollToBottom();
              });
              // logs.push(reader.result);
            }
          };
        }
        if (!logs.length) {
          // const logString = _.join(logs, '');
          // this.setState({
          //   logList: logs,
          // });
        }
      };

      this.socket = ws;

      // this.timer = setInterval(() => {
      //   if (logs.length > 0) {
      //     if (!_.isEqual(logs, oldLogs)) {
      //       const logString = _.join(logs, '');
      //       // editor.setValue(logString);
      //       // editor.execCommand('goDocEnd');
      //       // 如果没有返回数据，则不进行重新赋值给编辑器
      //       oldLogs = _.cloneDeep(logs);
      //     }
      //   } else if (!isFollow) {
      //     console.log('timer');
      //     // this.setState({
      //     //   logList: ['Loading...\n'],
      //     // });
      //   }
      // }, 0);
    } catch (e) {
      logs.push(`<span>${logs.length}</span>连接失败\n`);
      console.log('failed');
      this.setState({
        logList: logs,
      });
      throw new Error("Failed to construct 'WebSocket': The URL ERROR");
    }
  };

  handleDownload = ({
    previous = false,
    state = 'isDownload',
  }) => {
    const {
      record, clusterId: propsClusterId, projectId: propsProjectId,
      AppState: { currentMenuType: { projectId: currentProjectId } },
    } = this.props;
    const { namespace, name, podName: recordPodName } = record || {};
    const clusterId = propsClusterId || record?.clusterId;
    const projectId = propsProjectId || currentProjectId || record?.projectId;
    const podName = name || recordPodName;
    const { logId, containerName } = this.state;
    const wsUrl = removeEndsChar(window._env_.DEVOPS_HOST, '/');
    const secretKey = window._env_.DEVOPS_WEBSOCKET_SECRET_KEY;
    const key = `cluster:${clusterId}.log:${uuidv1()}`;
    const url = `${wsUrl}/websocket?previous=${previous}&key=${key}&group=from_front:${key}&processor=front_download_log&secret_key=${secretKey}&env=${namespace}&podName=${podName}&containerName=${containerName}&logId=${logId}&clusterId=${clusterId}&oauthToken=${getAccessToken()}&projectId=${projectId}`;
    const ws = new WebSocket(url);
    const logData = [];
    let time = 0;
    let polling;
    try {
      ws.onopen = () => {
        polling = setInterval(() => {
          time += 1;
          if (time === 10) {
            clearInterval(polling);
            ws.close();
          }
        }, 1000);
        this.setState({ [state]: true });
      };
      ws.onerror = (e) => {
        message.error('连接出错');
        this.setState({ [state]: false });
      };
      ws.onclose = () => {
        const blob = new Blob([logData.length ? _.join(logData, '') : ''], { type: 'text/plain' });
        const filename = '容器日志.log';
        saveAs(blob, filename);
        this.setState({ [state]: false });
      };

      ws.onmessage = (e) => {
        time = 0;
        if (e.data.size) {
          const reader = new FileReader();
          reader.readAsText(e.data, 'utf-8');
          reader.onload = () => {
            if (reader.result !== '') {
              logData.push(reader.result);
            }
          };
        }
      };
    } catch (e) {
      message.error('连接出错');
    }
  };

  scrollToBottom = () => {
    const element = document.querySelector('.c7n-log-editor');
    element.scrollTop = element.scrollHeight;
  }

  render() {
    const { visible, onClose, record: { containers, restartCount } } = this.props;
    const logCanRestart = restartCount > 0;
    const {
      following,
      fullScreen,
      containerName,
      isDownload,
      isRestartDownload,
      logList,
    } = this.state;
    const containerOptions = _.map(containers, (container) => {
      const { logId, name } = container;
      return (
        <Option key={logId} value={`${logId}+${name}`}>
          {name}
        </Option>
      );
    });

    return (
      <Sidebar
        visible={visible}
        title={<FormattedMessage id="log.header.title" />}
        onOk={onClose}
        className="c7n-container-sidebar c7n-region"
        okText={<FormattedMessage id="close" />}
        okCancel={false}
      >
        <Content
          className="sidebar-content"
        >

          <div className={fullScreen ? 'c7n-container-sidebar-content_full' : 'c7n-container-sidebar-content'}>
            <div className="c7n-term-title">
              <FormattedMessage id="container" />
              &nbsp;
              <Select className="c7n-log-siderbar-select" value={containerName} onChange={this.handleChange}>
                {containerOptions}
              </Select>
              <Tooltip title={!logCanRestart && '该容器暂未重启过，无法下载重启前容器日志。'}>
                <Button
                  className="c7ncd-container-log-download"
                  icon="get_app"
                  funcType="flat"
                  disabled={!logCanRestart}
                  onClick={() => this.handleDownload({
                    previous: true,
                    state: 'isRestartDownload',
                  })}
                  loading={isRestartDownload}
                >
                  下载重启前容器日志
                </Button>
              </Tooltip>
              <Button
                icon="get_app"
                funcType="flat"
                onClick={this.handleDownload}
                loading={isDownload}
              >
                下载容器日志
              </Button>
              <Button
                className="c7n-term-fullscreen"
                color="primary"
                funcType="flat"
                shape="circle"
                icon="fullscreen"
                onClick={this.setFullScreen}
              />
            </div>
            <div
              className={`c7n-podLog-action c7n-term-following ${fullScreen ? 'c7n-term-following_full' : ''}`}
              onClick={following ? this.stopFollowing : () => {
                console.log('click loadlog');
                this.loadLog(true, this);
              }}
              role="none"
            >
              {following ? 'Stop Following' : 'Start Following'}
            </div>
            <div className="c7n-term-wrap">
              <div
                className="c7n-log-editor"
              >
                {logList.map((item) => (
                  <p dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </div>
              {/* <ReactCodeMirror
                ref={(editor) => {
                  this.editorLog = editor;
                }}
                value="Loading..."
                className="c7n-log-editor"
                options={LOG_OPTIONS}
                preserveScrollPosition
              /> */}
            </div>
            <div
              className={`c7n-podLog-action c7n-term-totop ${fullScreen ? 'c7n-term-totop_full' : ''}`}
              onClick={this.goTop}
              role="none"
            >
              Go Top
            </div>
          </div>
        </Content>
      </Sidebar>
    );
  }
}
