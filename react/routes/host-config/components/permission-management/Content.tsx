import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Select, Form, Button,
} from 'choerodon-ui/pro';
import { UserInfo, CustomSelect, NewTips } from '@choerodon/components';
import { useHostPermissionStore } from '@/routes/host-config/components/permission-management/stores';
import { Record, FuncType } from '@/interface';
import './index.less';

const HostPermission = () => {
  const {
    selectDs,
    prefixCls,
    formatMessage,
    refresh,
    modal,
  } = useHostPermissionStore();

  useEffect(() => {
    selectDs.setState('permissionLabel', 'common');
  }, []);

  modal.handleOk(async () => {
    try {
      const res = await selectDs.submit();
      if (res === false) {
        return false;
      }
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
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
    const flag = selectDs.some((optionRecord: Record) => optionRecord.get('user') && optionRecord.get('user').iamUserId === record.get('iamUserId'));
    return !flag;
  }, []);

  const handleDelete = useCallback((record: Record) => {
    selectDs.remove(record);
  }, []);

  const handleCreate = useCallback(() => {
    selectDs.create();
  }, []);

  const handleClick = (value:any) => {
    selectDs.setState('permissionLabel', value.value);
  };

  const data = [{
    title: '主机使用权限',
    content: '分配有该权限的成员可以在当前主机中部署和管理应用。',
    value: 'common',
  },
  {
    title: '主机管理权限',
    content: '分配有该权限的成员可以在当前主机中部署和管理应用；可以管理当前主机；可以为项目所有者以外的成员分配当前主机的权限并进行管理。',
    value: 'administrator',
  },
  ];

  return (
    <>
      <CustomSelect
        onClickCallback={(value) => handleClick(
          value,
        )}
        selectedKeys={0}
        data={data}
        identity="value"
        mode="single"
        customChildren={(item): any => (
          <div className={`${prefixCls}-select-item`}>
            <h4>{item.title}</h4>
            <p>{item.content}</p>
          </div>
        )}
      />
      <p style={{ color: '#898BAC', marginTop: 28, marginBottom: 16 }}>
        权限分配
        <NewTips style={{ position: 'relative', top: -1, left: 5 }} helpText="对项目下【项目所有者】以外的成员进行权限分配。" />
      </p>
      {([
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
