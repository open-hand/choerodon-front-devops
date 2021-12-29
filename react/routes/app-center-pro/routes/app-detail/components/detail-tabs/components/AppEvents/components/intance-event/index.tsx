import React, { useState } from 'react';
import {
  Tooltip, Modal, Icon, Progress,
} from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';

import ReactCodeMirror from 'react-codemirror';

const logKey = Modal.key();
const logOptions = {
  theme: 'base16-dark',
  mode: 'textile',
  readOnly: true,
  lineNumbers: true,
  lineWrapping: true,
};

const InstanceEvent = ({
  index, jobPodStatus, name, log, flag, event, intlPrefix, formatMessage, showMore,
}:any) => {
  const [fullScreen, setFullScreen] = useState(false);
  let editorLog:any;

  /**
   *  全屏查看日志
   */
  function openFullScreen() {
    const cm = editorLog.getCodeMirror();
    const wrap = cm.getWrapperElement();
    cm.state.fullScreenRestore = {
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
      width: wrap.style.width,
      height: wrap.style.height,
    };
    wrap.style.width = '';
    wrap.style.height = 'auto';
    wrap.className += ' CodeMirror-fullScreen';
    setFullScreen(true);
    document.documentElement.style.overflow = 'hidden';
    cm.refresh();
    window.addEventListener('keydown', (e) => {
      setNormal();
    });
  }

  /**
   * 任意键退出全屏查看
   */
  function setNormal() {
    if (!editorLog) return;

    const cm = editorLog.getCodeMirror();
    const wrap = cm.getWrapperElement();
    wrap.className = wrap.className.replace(/\s*CodeMirror-fullScreen\b/, '');
    setFullScreen(false);
    document.documentElement.style.overflow = '';
    const info = cm.state.fullScreenRestore;
    wrap.style.width = info.width;
    wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
    window.removeEventListener('keydown', (e) => {
      setNormal();
    });
  }

  function openLogDetail() {
    Modal.open({
      key: logKey,
      title: formatMessage({ id: 'container.log.header.title' }),
      drawer: true,
      okText: formatMessage({ id: 'close' }),
      okCancel: false,
      style: {
        width: 1000,
      },
      children: (
        <div className={fullScreen ? 'c7ncd-log-sidebar-content_full' : 'c7ncd-log-sidebar-content'}>
          <div className="c7ncd-term-fullscreen">
            <Tooltip title={formatMessage({ id: `${intlPrefix}.instance.cases.fullScreen` })}>
              <Button
                className="c7ncd-term-fullscreen-button"
                funcType={'flat' as any}
                shape={'circle' as any}
                icon="fullscreen"
                onClick={openFullScreen}
              />
            </Tooltip>
          </div>
          <div className="c7n-term-wrap">
            <ReactCodeMirror
              ref={(editor:any) => { editorLog = editor; }}
              value={log}
              options={logOptions}
              className="c7n-log-editor"
            />
          </div>
        </div>),
    });
  }

  function handleClick() {
    showMore(`${index}-${name}`);
  }

  return (
    <div key={index} className="operation-content-step">
      <div className="content-step-title">
        {jobPodStatus === 'running'
          ? (
            <div>
              <Progress type={'loading' as any} />
            </div>
          )
          : (
            <Icon
              type="wait_circle"
              className={`content-step-icon-${jobPodStatus}`}
            />
          )}
        <span className="content-step-title-text">{name}</span>
        {log && (
          <Tooltip
            title={formatMessage({ id: `${intlPrefix}.instance.cases.log` })}
            placement="bottom"
          >
            <Icon type="find_in_page" onClick={openLogDetail} />
          </Tooltip>
        )}
      </div>
      <div className="content-step-des">
        <pre className={!flag ? 'content-step-des-hidden' : ''}>
          {event}
        </pre>
        {event && event.split('\n').length > 4 ? (
          <a role="none" onClick={handleClick}>
            <FormattedMessage id={flag ? 'shrink' : 'expand'} />
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default InstanceEvent;
