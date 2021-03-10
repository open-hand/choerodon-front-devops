import TimePopover from '@/components/timePopover';
import UserInfo from '@/components/userInfo';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { get, map } from 'lodash';

import getDuration from '@/utils/getDuration';
import { usePipelineTriggerNumberStore } from '../../stores';

const { Column } = Table;

const MyTable = () => {
  const {
    pipelineTableDs,
    prefixCls,
    formatMessage,
  } = usePipelineTriggerNumberStore();
  useEffect(() => {

  }, []);

  const renderUsers = ({ record }) => {
    const iamUserDTO = record.get('iamUserDTO');
    const imageUrl = get(iamUserDTO, 'imageUrl');
    const name = get(iamUserDTO, 'realName');
    const id = get(iamUserDTO, 'ldap') ? get(iamUserDTO, 'loginName') : get(iamUserDTO, 'email');
    return (
      <UserInfo {...{
        name,
        id,
        avatar: imageUrl,
      }}
      />
    );
  };

  const renderDate = ({ record }) => (
    <TimePopover content={record.get('createdDate')} />
  );

  const renderStatus = ({ value }) => (
    <span className={`${prefixCls}-table-status ${prefixCls}-table-status-${value}`}>
      {
        formatMessage({ id: value })
      }
    </span>
  );

  const renderStages = ({ value }) => (
    get(value, 'length') ? (
      <div className={`${prefixCls}-table-stages`}>
        {
            map(value, (item, index) => (
              <>
                {index > 0 && <span className={`${prefixCls}-table-stages-item-line`} />}
                <span
                  className={
                  `${prefixCls}-table-stages-item 
                  ${prefixCls}-table-stages-item-${get(item, 'status')}`
                }
                />
              </>
            ))
          }
      </div>
    ) : ''
  );

  return (
    <Table dataSet={pipelineTableDs} queryBar="none" className={`${prefixCls}-table`}>
      <Column name="status" renderer={renderStatus} />
      <Column name="viewId" renderer={({ value }) => `#${value}`} />
      <Column name="pipelineName" />
      <Column name="stageRecordVOS" renderer={renderStages} />
      <Column name="appServiceName" />
      <Column name="startDate" renderer={renderDate} />
      <Column name="durationSeconds" renderer={({ value }) => getDuration({ value })} />
      <Column name="user" renderer={renderUsers} />
    </Table>
  );
};

export default observer(MyTable);
