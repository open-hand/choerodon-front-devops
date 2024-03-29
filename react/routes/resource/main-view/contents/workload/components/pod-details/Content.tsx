import React, {
  useState, useCallback,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Action } from '@choerodon/master';
import { Table } from 'choerodon-ui/pro';
import { Icon, Popover, Tooltip } from 'choerodon-ui';
import map from 'lodash/map';
import { observer } from 'mobx-react-lite';
import { TableQueryBarType } from '@/interface';
import MouserOverWrapper from '@/components/MouseOverWrapper';
import TimePopover from '@/components/timePopover/TimePopover';
import StatusTags from '@/components/status-tag';
import LogSiderbar from '@/components/log-siderbar';
import TermSiderbar from '@/components/term-sidebar';

import './index.less';
import { usePodDetailstore } from './stores';

const { Column } = Table;

const ICON_CODE:any = {
  available: 'check_circle',
  unavailable: 'cancel',
  health: 'help',
};

const PodDetail = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    projectId,
    formatMessage,
    podsDs,
  } = usePodDetailstore();

  const [visible, setVisible] = useState(false);
  const [shellVisible, setShellVisible] = useState(false);

  function getStatusCode(record:any) {
    const ready = record.get('ready');
    const status = record.get('status');
    let statusCode = 'unavailable';
    if (ready) {
      statusCode = 'available';
    } else if (status === 'Running') {
      statusCode = 'health';
    }
    return statusCode;
  }

  const renderName = ({ value, record }:any) => {
    const statusCode = getStatusCode(record);

    return (
      <>
        <Tooltip title={<FormattedMessage id={`ist.ready.${statusCode}`} />}>
          <Icon
            type={ICON_CODE[statusCode]}
            className={`${prefixCls}-pod-ready-${statusCode}`}
          />
        </Tooltip>
        <MouserOverWrapper text={value} width={0.2} style={{ display: 'inline' }}>
          {value}
        </MouserOverWrapper>
      </>
    );
  };

  const renderStatus = ({ value, record }:any) => {
    const wrapStyle = {
      width: 54,
    };

    const statusMap:any = {
      Completed: [true, '#00bf96'],
      Running: [false, '#00bf96'],
      Error: [false, '#f44336'],
      Pending: [false, '#ff9915'],
    };

    const [wrap, color] = statusMap[value] || [true, 'rgba(0, 0, 0, 0.36)'];
    const newColor = getStatusCode(record) === 'health' ? '#ffb100' : color;

    return (
      <StatusTags
        ellipsis={wrap}
        color={newColor}
        name={value}
        style={wrapStyle}
      />
    );
  };

  const renderContainers = ({ value }:any) => {
    const node:any = [];
    let item;
    if (value && value.length) {
      // eslint-disable-next-line prefer-destructuring
      item = value[0];
      map(value, ({ ready, name }, index) => {
        node.push(
          <div className="column-container-mt" key={index}>
            <Tooltip title={<FormattedMessage id={`ist.${ready ? 'y' : 'n'}`} />}>
              <Icon
                type={ready ? 'check_circle' : 'cancel'}
                className={`${prefixCls}-pod-ready-${ready ? 'check' : 'cancel'}`}
              />
            </Tooltip>
            <span>{name}</span>
          </div>,
        );
      });
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {item && (
        <>
          <Tooltip title={<FormattedMessage id={`ist.${item.ready ? 'y' : 'n'}`} />}>
            <Icon
              type={item.ready ? 'check_circle' : 'cancel'}
              className={`${prefixCls}-pod-ready-${item.ready ? 'check' : 'cancel'}`}
            />
          </Tooltip>
          <MouserOverWrapper text={item.name} width={0.1} style={{ display: 'inline' }}>
            {item.name}
          </MouserOverWrapper>
        </>
        )}
        {node.length > 1 && (
        <Popover
          arrowPointAtCenter
          placement="bottomRight"
          content={<>{node}</>}
          overlayClassName={`${prefixCls}-pods-popover`}
        >
          <Icon type="expand_more" className="container-expend-icon" />
        </Popover>
        )}
      </div>
    );
  };

  const renderDate = useCallback(({ value }) => (
    <TimePopover content={value} />
  ), []);

  const renderAction = ({ value, record }:any) => {
    const buttons = [
      {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.pod.delete'],
        text: formatMessage({ id: 'delete' }),
        action: () => deletePod(),
      },
    ];
    if (record.get('containers')?.length) {
      buttons.unshift({
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.pod.log'],
        text: formatMessage({ id: `${intlPrefix}.instance.log` }),
        action: () => openLog(),
      }, {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.pod.shell'],
        text: formatMessage({ id: `${intlPrefix}.instance.term` }),
        action: () => openShell(),
      });
    }
    return <Action data={buttons} />;
  };
  /**
   * 控制Log侧边窗的可见性
   */
  function openLog() {
    setVisible(true);
  }
  const closeLog = () => {
    setVisible(false);
  };
  /**
   * 控制Shell侧边窗的可见性
   */
  function openShell() {
    setShellVisible(true);
  }
  const closeShell = () => {
    setShellVisible(false);
  };
  /**
   * 删除Pod
   */
  function deletePod() {
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.instance.pod.delete.title` }),
      children: formatMessage({ id: `${intlPrefix}.instance.pod.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
    };
    podsDs.delete(podsDs.current, modalProps);
  }

  return (
    <>
      <div className="c7ncd-tab-table">
        <Table
          dataSet={podsDs}
          border={false}
          queryBar={'bar' as TableQueryBarType}
          className={`${prefixCls}-instance-pods`}
        >
          <Column name="name" renderer={renderName} />
          <Column renderer={renderAction} width={70} />
          <Column name="containers" renderer={renderContainers} />
          <Column name="restartCount" />
          <Column name="nodeName" />
          <Column name="ip" width={120} />
          <Column name="creationDate" sortable renderer={renderDate} width={120} />
          <Column name="status" renderer={renderStatus} width={100} />
        </Table>
      </div>
      {visible
        && <LogSiderbar visible={visible} onClose={closeLog} record={podsDs.current?.toData()} />}
      {shellVisible
        && (
        <TermSiderbar
          visible={shellVisible}
          onClose={closeShell}
          record={podsDs.current?.toData()}
          projectId={projectId}
        />
        )}
    </>
  );
});

export default PodDetail;
