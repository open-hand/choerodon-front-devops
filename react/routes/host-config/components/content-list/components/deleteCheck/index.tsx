import React, {
  FC, ReactNode, useCallback, useEffect, useMemo, useState,
} from 'react';
import { Spin, Icon } from 'choerodon-ui/pro';
import { Input } from 'choerodon-ui';
import HostConfigServices from '@/routes/host-config/services';
import apis from '../../../../apis';

import './index.less';

interface DeleteCheckProps {
  modal?:any,
  projectId:number,
  hostId:string,
  handleDelete():void,
  formatMessage(arg0: object, arg1?: object): string,
  hostType:string,
}

const DeleteCheck:FC<DeleteCheckProps> = (props) => {
  const {
    modal,
    projectId,
    hostId,
    handleDelete,
    formatMessage,
    hostType,
  } = props;
  const [loading, setLoading] = useState<boolean>(true);
  const [text, setText] = useState<string | ReactNode>('');

  const prefixCls = useMemo(() => 'c7ncd-host-config', []);
  const intlPrefix = useMemo(() => 'c7ncd.host.config', []);

  const checkNow = useCallback(async ():Promise<void> => {
    modal.update({
      title: '正在校验主机...',
    });
    try {
      const res = await apis.checkHostDeletable(projectId, hostId, hostType);
      setLoading(false);
      if (res) {
        let okText = formatMessage({ id: 'delete' });
        if (hostType === 'deploy') {
          const shell = await HostConfigServices.getDeleteShell(projectId, hostId);
          setText(
            <div>
              <span>{formatMessage({ id: `${intlPrefix}.delete.des` })}</span>
              <div
                className={`${prefixCls}-delete-input`}
              >
                <Input
                  value={shell}
                  readOnly
                  copy
                />
              </div>
              <div className={`${prefixCls}-delete-notice`}>
                <Icon type="error" />
                <span>{formatMessage({ id: `${intlPrefix}.delete.tips` })}</span>
              </div>
            </div>,
          );
          okText = formatMessage({ id: `${intlPrefix}.delete.btn` });
        } else {
          setText('确定要删除该主机配置吗？');
        }
        modal.update({
          title: '删除主机',
          okText,
          okProps: {
            color: 'red',
          },
          cancelProps: {
            color: '#000',
          },
          onOk: handleDelete,
          footer: (okBtn:ReactNode, cancelBtn:ReactNode) => (
            <>
              {okBtn}
              {cancelBtn}
            </>
          ),
        });
        return;
      }
      setText(hostType !== 'distribute_test' ? '该主机含有关联的流水线主机部署任务，无法删除。' : '该主机状态已改变，请刷新后重试');
      modal.update({
        title: '删除主机',
        footer: (okBtn:ReactNode, cancelBtn:ReactNode) => (
          <>
            {cancelBtn}
          </>
        ),
        cancelText: '我知道了',
      });
    } catch (error) {
      modal.update({
        title: '删除主机',
        footer: (okBtn:ReactNode, cancelBtn:ReactNode) => (
          <>
            {cancelBtn}
          </>
        ),
        cancelText: '取消',
      });
      throw new Error(error);
    }
  }, [projectId, hostId]);

  useEffect(() => {
    checkNow();
  }, [projectId, hostId]);

  if (loading) {
    return <Spin spinning />;
  }

  return (
    <div>
      {text}
    </div>
  );
};

export default DeleteCheck;
