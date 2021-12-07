/* eslint-disable */
import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { useFormatMessage } from '@choerodon/master';
import { Tooltip } from 'choerodon-ui';
import { NewTips, TimePopover } from '@choerodon/components';
import SyncSituation from './SyncSituation';
import { useResourceStore } from '../../../../../../../stores';

import './index.less';
import { useREStore } from '../../../../stores';

const { Column } = Table;

export default function Situation() {
  const {
    prefixCls,
    intlPrefix,
    formatMessage,
  } = useResourceStore();

  const { gitopsLogDs } = useREStore();

  const format = useFormatMessage('c7ncd.resource');

  function renderMsg({ value }:any) {
    return (
      <Tooltip title={value} placement="topLeft">
        {value}
      </Tooltip>
    );
  }

  function renderFileLink({ record }:any) {
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

  function renderCommit({ record }:any) {
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

  function renderTime({ value }:any) {
    return <TimePopover content={value} />;
  }

  return (
    <div className={`${prefixCls}-environment-sync`}>
      <SyncSituation />
      <div className={`${prefixCls}-environment-sync-table-title`}>
        <NewTips
          title={format({ id: 'ErrorLog' })}
          helpText={formatMessage({ id: `${intlPrefix}.environment.error.tips` })}
        />
      </div>
      <Table
        // @ts-expect-error
        locale={{
          emptyText: formatMessage({ id: 'c7ncd.env.sync.empty' }),
        }}
        dataSet={gitopsLogDs}
        border={false}
        queryBar={'none' as any}
      >
        <Column name="error" renderer={renderMsg} />
        <Column name="filePath" renderer={renderFileLink} />
        <Column name="commit" renderer={renderCommit} />
        <Column name="lastUpdateDate" sortable renderer={renderTime} width={105} />
      </Table>
    </div>
  );
}
