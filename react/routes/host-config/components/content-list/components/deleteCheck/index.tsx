import React, {
  FC, ReactNode, useCallback, useEffect, useState,
} from 'react';
import { Spin } from 'choerodon-ui/pro';
import apis from '../../../../apis';

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
  const [text, setText] = useState<string>('');

  const checkNow = useCallback(async ():Promise<void> => {
    modal.update({
      title: '正在校验主机...',
    });
    try {
      const res = await apis.checkHostDeletable(projectId, hostId, hostType);
      setLoading(false);
      if (res) {
        setText('确定要删除该主机配置吗？');
        modal.update({
          title: '删除主机',
          okText: formatMessage({ id: 'delete' }),
          okProps: {
            color: 'red',
          },
          cancelProps: {
            color: '#000',
          },
          onOk: handleDelete,
          footer: (okBtn:ReactNode, cancelBtn:ReactNode) => (
            <>
              {cancelBtn}
              {okBtn}
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
