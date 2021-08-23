import React, {
  useState, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';
import { Action } from '@choerodon/boot';
import { Table } from 'choerodon-ui/pro';
import { Icon, Popover, Tooltip } from 'choerodon-ui';
import map from 'lodash/map';
import { TimePopover } from '@choerodon/components';
import MouserOverWrapper from '@/components/MouseOverWrapper';
import StatusTags from '@/components/status-tag';
import LogSiderbar from '@/components/log-siderbar';
import TermSiderbar from '@/components/term-sidebar';
import { useAppDetailTabsStore } from '../../stores';

import './index.less';

const { Column } = Table;

const ICON_CODE:any = {
  available: 'check_circle',
  unavailable: 'cancel',
  health: 'help',
};

const PodDetail = observer(() => {
  const {
    subfixCls,
    intlPrefix,
    projectId,
    formatMessage,
    podDetailsDs,
  } = useAppDetailTabsStore();

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

  function renderName({ value, record }:any) {
    const statusCode = getStatusCode(record);

    return (
      <>
        <Tooltip title={<FormattedMessage id={`ist.ready.${statusCode}`} />}>
          <Icon
            type={ICON_CODE[statusCode]}
            className={`${subfixCls}-pod-ready-${statusCode}`}
          />
        </Tooltip>
        <MouserOverWrapper text={value} width={0.2} style={{ display: 'inline' }}>
          {value}
        </MouserOverWrapper>
      </>
    );
  }

  function renderStatus({ value, record }:any) {
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
  }

  function renderContainers({ value }:any) {
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
                className={`${subfixCls}-pod-ready-${ready ? 'check' : 'cancel'}`}
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
              className={`${subfixCls}-pod-ready-${item.ready ? 'check' : 'cancel'}`}
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
          overlayClassName={`${subfixCls}-pods-popover`}
        >
          <Icon type="expand_more" className="container-expend-icon" />
        </Popover>
        )}
      </div>
    );
  }

  const renderDate = useCallback(({ value }) => (
    <TimePopover content={value} />
  ), []);

  function renderAction({ record }:any) {
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
  }
  /**
   * 控制Log侧边窗的可见性
   */
  function openLog() {
    setVisible(true);
  }
  function closeLog() {
    setVisible(false);
  }
  /**
   * 控制Shell侧边窗的可见性
   */
  function openShell() {
    setShellVisible(true);
  }
  function closeShell() {
    setShellVisible(false);
  }
  /**
   * 删除Pod
   */
  function deletePod() {
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.instance.pod.delete.title` }),
      children: formatMessage({ id: `${intlPrefix}.instance.pod.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
    };
    podDetailsDs.delete(podDetailsDs.current, modalProps);
  }

  return (
    <>
      <div>
        <Table
          dataSet={podDetailsDs as any}
          border={false}
          queryBar={'bar' as any}
          className={`${subfixCls}-instance-pods c7ncd-tab-table`}
        >
          <Column name="name" renderer={renderName} />
          <Column renderer={renderAction} width={60} />
          <Column name="containers" renderer={renderContainers} />
          <Column name="ip" width={'1.2rem' as any} />
          <Column name="creationDate" sortable renderer={renderDate} width={105} />
          <Column name="status" renderer={renderStatus} width={'1rem' as any} />
        </Table>
      </div>
      {visible
        && (
        <LogSiderbar
          visible={visible}
          onClose={closeLog}
          record={podDetailsDs.current?.toData()}
          projectId={projectId}
        />
        )}
      {shellVisible
        && (
        <TermSiderbar
          visible={shellVisible}
          onClose={closeShell}
          record={podDetailsDs.current?.toData()}
          projectId={projectId}
        />
        )}
    </>
  );
});

export default PodDetail;
