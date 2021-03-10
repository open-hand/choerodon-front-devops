import React, { useCallback, useMemo } from 'react';
import TimePopover from '@/components/timePopover';
import UserInfo from '@/components/userInfo';
import { Table } from 'choerodon-ui/pro';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { get, map } from 'lodash';
import getDuration from '@/utils/getDuration';
import {
  UserDTOProps, Record, DataSet, TableColumnTooltip,
} from '@/interface';

import './index.less';

interface TableProps {
  tableDs: DataSet
  intl: {
    formatMessage(arg0: object, arg1?: object): string,
  }
}

interface RenderFunProps {
  value: any,
  record: Record,
}

const { Column } = Table;

const PipelineTable = ({ tableDs, intl: { formatMessage } }: TableProps) => {
  const prefixCls = useMemo(() => 'c7ncd-reports-pipeline-table', []);

  const renderStatus = useCallback(({ value }: RenderFunProps) => (
    <span className={`${prefixCls}-status ${prefixCls}-status-${value}`}>
      {formatMessage({ id: value })}
    </span>
  ), []);

  const renderViewId = useCallback(({ value }: RenderFunProps) => (`#${value}`), []);

  const renderStages = useCallback(({ value }: RenderFunProps) => (
    get(value, 'length') ? (
      <div className={`${prefixCls}-stages`}>
        {
          map(value, (item: object, index: number) => (
            <>
              {index > 0 && <span className={`${prefixCls}-stages-item-line`} />}
              <span
                className={
                `${prefixCls}-stages-item 
                ${prefixCls}-stages-item-${get(item, 'status')}`
              }
              />
            </>
          ))
        }
      </div>
    ) : ''
  ), []);

  const renderUsers = useCallback(({ value }: { value: UserDTOProps }) => {
    const imageUrl = get(value, 'imageUrl');
    const name = get(value, 'realName') || '';
    const id = get(value, 'ldap') ? get(value, 'loginName') : get(value, 'email');
    return (
      <UserInfo {...{
        name,
        id,
        avatar: imageUrl,
      }}
      />
    );
  }, []);

  const renderDuration = useCallback(({ value }: RenderFunProps) => (
    getDuration({ value })
  ), []);

  const renderDate = useCallback(({ value }: RenderFunProps) => (
    <TimePopover content={value} />
  ), []);

  return (
    <Table
      dataSet={tableDs}
      className={`${prefixCls}`}
    >
      <Column name="status" renderer={renderStatus} />
      <Column name="viewId" renderer={renderViewId} />
      <Column name="pipelineName" tooltip={'overflow' as TableColumnTooltip} />
      <Column name="stageRecordVOS" renderer={renderStages} />
      <Column name="appServiceName" tooltip={'overflow' as TableColumnTooltip} />
      <Column name="createdDate" renderer={renderDate} />
      <Column name="durationSeconds" renderer={renderDuration} />
      <Column name="iamUserDTO" renderer={renderUsers} />
    </Table>
  );
};

export default injectIntl(observer(PipelineTable));
