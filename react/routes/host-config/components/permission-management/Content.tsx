import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  SelectBox, Select, Form, Button,
} from 'choerodon-ui/pro';
import { UserInfo } from '@choerodon/components';
import { useHostPermissionStore } from '@/routes/host-config/components/permission-management/stores';
import { Record, UserDTOProps, FuncType } from '@/interface';
import map from 'lodash/map';

const { Option } = Select;

const HostPermission = () => {
  const {
    selectDs,
    prefixCls,
    intlPrefix,
    formatMessage,
    refresh,
    modal,
    formDs,
  } = useHostPermissionStore();

  modal.handleOk(async () => {
    try {
      const userIds = selectDs.map((record) => record.get('iamUserId'));
      if (await formDs.submit() !== false) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const renderUserOption = useCallback(({
    record,
    value,
    text,
  }) => {
    if (!value) {
      return null;
    }
    const sourceData = typeof value === 'object' ? value : record?.toData();
    const {
      realName, loginName, imageUrl,
    } = sourceData || {};
    return (
      <UserInfo
        realName={realName}
        loginName={loginName}
        avatar={imageUrl}
      />
    );
  }, []);

  const optionsFilter = useCallback((record: Record): boolean => {
    const flag = selectDs.some((optionRecord: Record) => optionRecord.get('iamUserId') === record.get('iamUserId'));
    return !flag;
  }, []);

  const handleDelete = useCallback((record: Record) => {
    selectDs.remove(record);
  }, []);

  const handleCreate = useCallback(() => {
    selectDs.create();
  }, []);

  return (
    <>
      <Form dataSet={formDs} className={`${prefixCls}-form`}>
        <SelectBox name="skipCheckPermission">
          <Option value>{formatMessage({ id: 'member_all' })}</Option>
          <Option value={false}>{formatMessage({ id: 'member_specific' })}</Option>
        </SelectBox>
      </Form>
      {formDs.current && !formDs.current.get('skipCheckPermission') && ([
        selectDs.map((record: Record) => (
          <Form record={record} columns={10} key={record.id}>
            <Select
              name="user"
              searchable
              searchMatcher="name"
              optionRenderer={renderUserOption}
              renderer={renderUserOption}
              optionsFilter={optionsFilter}
              colSpan={9}
            />
            <Button
              icon="delete"
              funcType={'flat' as FuncType}
              onClick={() => handleDelete(record)}
              disabled={selectDs.length === 1}
              className="c7ncd-form-record-delete-btn"
            />
          </Form>
        )),
        <Button
          icon="add"
          funcType={'flat' as FuncType}
          onClick={handleCreate}
        >
          {formatMessage({ id: 'add_member' })}
        </Button>,
      ])}
    </>
  );
};

export default observer(HostPermission);
