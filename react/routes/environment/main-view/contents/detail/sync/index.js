/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable */
import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import TimePopover from '../../../../../../components/time-popover';
import SyncSituation from './Situation';
import { useDetailStore } from '../stores';
import Tips from '../../../../../../components/new-tips';

import './index.less';

const { Column } = Table;

export default function Situation() {
  const {
    prefixCls,
    intlPrefix,
    gitopsLogDs,
    intl: { formatMessage },
  } = useDetailStore();

  function renderMsg({ value }) {
    return (
      <Tooltip title={value} placement="topLeft">
        {value}
      </Tooltip>
    );
  }

  function renderFileLink({ record }) {
    const url = record.get('fileUrl');
    const path = record.get('filePath');
    return (
      <a
        href={url}
        target="_blank"
        rel="nofollow me noopener noreferrer"
      >
        <span>{path}</span>
      </a>
    );
  }

  function renderCommit({ record }) {
    const url = record.get('commitUrl');
    const commit = record.get('commit');
    return (
      <a
        href={url}
        target="_blank"
        rel="nofollow me noopener noreferrer"
      >
        <span>{commit}</span>
      </a>
    );
  }

  function renderTime({ value }) {
    return <TimePopover datetime={value} />;
  }

  return (
    <div className={`${prefixCls}-environment-sync`}>
      <SyncSituation />
      <div className={`${prefixCls}-environment-sync-table-title`}>
        <Tips
          title={formatMessage({ id: 'c7ncd.environment.ErrorLog' })}
          helpText={formatMessage({ id: `${intlPrefix}.environment.error.tips` })}
        />
      </div>
      <Table
        locale={{
          emptyText: formatMessage({ id: 'c7ncd.env.sync.empty' }),
        }}
        dataSet={gitopsLogDs}
        border={false}
        queryBar="none"
      >
        <Column name="error" renderer={renderMsg} />
        <Column header={formatMessage({ id: 'c7ncd.resource.File' })} name="filePath" renderer={renderFileLink} />
        <Column header={formatMessage({ id: 'c7ncd.resource.Commit' })} name="commit" renderer={renderCommit} />
        <Column name="lastUpdateDate" sortable renderer={renderTime} width={105} />
      </Table>
    </div>
  );
}
