import React, {
  FC, ReactNode, useCallback, useEffect, useMemo, useState,
} from 'react';
import { Spin, Icon } from 'choerodon-ui/pro';
import { Input } from 'choerodon-ui';
import HostConfigServices from '@/routes/host-config/services';
import HostConfigApis from '@/routes/host-config/apis/DeployApis';

import './index.less';

interface DeleteCheckProps {
  modal?:any,
  projectId:number,
  hostId:string,
  handleDelete():void,
  formatMessage(arg0: object, arg1?: object): string,
}

const DeleteCheck:FC<DeleteCheckProps> = (props) => {
  const {
    modal,
    projectId,
    hostId,
    handleDelete,
    formatMessage,
  } = props;
  const [loading, setLoading] = useState<boolean>(true);
  const [text, setText] = useState<string | ReactNode>('');

  const prefixCls = useMemo(() => 'c7ncd-host-config', []);
  const intlPrefix = useMemo(() => 'c7ncd.host.config', []);

  const checkNow = useCallback(async ():Promise<void> => {
    try {
      const res = await HostConfigApis.checkHostDeletable(projectId, hostId);
      setLoading(false);
      if (res) {
        const shell = await HostConfigServices.getDeleteShell(projectId, hostId);
        setText(
          <div>
            <span>{formatMessage({ id: `${intlPrefix}.delete.des1` })}</span>
            <br />
            <span>{formatMessage({ id: `${intlPrefix}.delete.des2` })}</span>
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
        modal.update({
          okText: formatMessage({ id: `${intlPrefix}.delete.btn` }),
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
      setText('该主机含有关联的流水线主机部署任务，无法删除。');
      modal.update({
        footer: (okBtn:ReactNode, cancelBtn:ReactNode) => (
          <>
            {cancelBtn}
          </>
        ),
        cancelText: '我知道了',
      });
    } catch (error) {
      modal.update({
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
