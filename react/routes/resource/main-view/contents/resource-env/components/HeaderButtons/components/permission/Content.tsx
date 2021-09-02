/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { SelectBox, Select, Form } from 'choerodon-ui/pro';
import { UserInfo } from '@choerodon/components';
import DynamicSelect from '@/components/dynamic-select-new';
import { environmentApiApi } from '@/api';
import { usePermissionModalStore } from './stores';

const { Option } = Select;

export default observer(() => {
  const {
    nonePermissionDs,
    refresh,
    intlPrefix,
    modal,
    formatMessage,
    permissionsDs,
    baseDs,
  } = usePermissionModalStore();

  const record = useMemo(() => baseDs.current, [baseDs.current]);

  function addUsers({ envId, ...rest }:any) {
    const data = {
      envId,
      ...rest,
    };
    return environmentApiApi.addUserByPermission(envId, JSON.stringify(data));
  }

  async function handleModalOk() {
    const skipCheckPermission = record.get('skipCheckPermission');
    const baseData = {
      envId: record.get('id'),
      objectVersionNumber: record.get('objectVersionNumber'),
      skipCheckPermission,
    };
    try {
      const res = skipCheckPermission ? await addUsers({
        userIds: [],
        ...baseData,
      }) : await permissionsDs.submit();
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }

  modal.handleOk(handleModalOk);

  modal.handleCancel(() => {
    record.reset();
    permissionsDs.reset();
  });

  function renderUserOption({ record: optionRecord }:any) {
    return <UserInfo realName={optionRecord.get('realName') || ''} loginName={record.get('loginName')} />;
  }

  function renderer({ optionRecord }:any) {
    return <UserInfo realName={optionRecord.get('realName') || ''} loginName={record.get('loginName')} />;
  }

  return (
    <>
      <Form record={record}>
        <SelectBox name="skipCheckPermission">
          <Option value>{formatMessage({ id: `${intlPrefix}.member.all` })}</Option>
          <Option value={false}>{formatMessage({ id: `${intlPrefix}.member.specific` })}</Option>
        </SelectBox>
      </Form>
      {record && !record.get('skipCheckPermission') && (
        <DynamicSelect
          selectDataSet={permissionsDs}
          optionsRenderer={renderUserOption}
          optionsDataSet={nonePermissionDs}
          renderer={renderer}
          selectName="iamUserId"
          addText={formatMessage({ id: `${intlPrefix}.add.member` })}
        />
      )}
    </>
  );
});
