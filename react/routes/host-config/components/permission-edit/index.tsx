import React, { useEffect } from 'react';
import {
  Select, Form,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { CustomSelect } from '@choerodon/components';
import { axios } from '@choerodon/boot';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';
import './index.less';

let permissionValue :string;

const PermissionEditContent = (props: any) => {
  const {
    record, modal, mainStore,
    refresh, projectId,
  } = props;

  const hostId = mainStore.getSelectedHost?.id;

  const data = [{
    title: '主机使用权限',
    content: '分配了此权限的人员,可以在该主机中部署应用,并对应用进行删除、修改等操作。',
    value: 'common',
  },
  {
    title: '主机管理权限',
    content: '该权限包含了主机使用权限。分配了此权限的人员,还可以进行连接主机、断开连接主机、删除主机、修改主机、为【项目所有者】以外的成员分配该主机权限等操作。',
    value: 'administrator',
  },
  ];

  useEffect(() => {
    permissionValue = record?.get('permissionLabel');
  }, []);

  modal.handleOk(async () => {
    try {
      const res = await axios.post(HostConfigApi.updateHostPermission(projectId,
        hostId), {
        hostId,
        objectVersionNumber: mainStore.getSelectedHost?.objectVersionNumber,
        permissionLabel: permissionValue,
        userIds: [record.get('iamUserId')],
      });
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
    } catch (e) {
      return false;
    }
  });

  const handleClick = (value: any) => {
    permissionValue = value.value;
  };
  const prefixCls = 'c7ncd-host-config-permission-edit';
  return (
    <div>
      <Form columns={10}>
        <Select label="项目成员" disabled value={record?.get('realName')} colSpan={10} />
      </Form>
      <CustomSelect
        onClickCallback={(value) => handleClick(
          value,
        )}
        selectedKeys={record?.get('permissionLabel')}
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
    </div>
  );
};

export default observer(PermissionEditContent);
