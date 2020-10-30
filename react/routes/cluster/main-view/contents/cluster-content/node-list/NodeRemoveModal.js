import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Form, SelectBox, Select, Spin,
} from 'choerodon-ui/pro';
import { axios } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';

const NodeRemove = observer(({
  nodeName,
  modal,
  nodeId,
  projectId,
  formatMessage,
  intlPrefix,
  contentStore,
  afterOk,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [cannotMes, setCannotMes] = useState('');

  const getModalProps = useCallback((res) => {
    const {
      enableDeleteWorker,
      enableDeleteEtcd,
      enableDeleteMaster,
    } = res;
    const removable = enableDeleteEtcd && enableDeleteMaster && enableDeleteWorker;
    if (removable) {
      return {
        title: formatMessage({ id: `${intlPrefix}.node.modal.canDelete` }),
        okProps: {
          color: 'red',
        },
        cancelProps: {
          color: 'dark',
        },
        okText: '删除',
        footer: (okbtn, cancelbtn) => (
          <>
            {cancelbtn}
            {okbtn}
          </>
        ),
      };
    }
    return {
      title: formatMessage({ id: `${intlPrefix}.node.modal.cannotDelete` }),
      footer: (okbtn, cancelbtn) => (
        <>
          {okbtn}
        </>
      ),
      okText: formatMessage({ id: 'iknow' }),
    };
  }, []);

  const handleCannotMes = (res) => {
    const {
      enableDeleteWorker,
      enableDeleteEtcd,
      enableDeleteMaster,
    } = res;

    let tempMes;

    if (typeof enableDeleteMaster === 'boolean' && !enableDeleteMaster) {
      tempMes = '节点“节点名称”为集群下唯一的master节点，无法删除';
    }
    if (typeof enableDeleteEtcd === 'boolean' && !enableDeleteEtcd) {
      tempMes = '节点“节点名称”为集群下唯一的etcd节点，无法删除';
    }
    if (typeof enableDeleteWorker === 'boolean' && !enableDeleteWorker) {
      tempMes = '节点“节点名称”为集群下唯一的worker节点，无法删除';
    }
    setCannotMes(tempMes || null);
  };

  async function loadPermission() {
    try {
      const res = await axios.get(contentStore.getDeleteNodePemissionUrl(projectId, nodeId));
      if (res && res.failed) {
        return res;
      }
      handleCannotMes(res);
      setLoading(false);

      res && modal.update(getModalProps(res));
      modal.handleOk(handleSubmit);

      return true;
    } catch (error) {
      return error;
    }
  }

  async function handleSubmit() {
    try {
      const res = await contentStore.deleteNode(projectId, nodeId);
      if (res && res.failed) {
        return false;
      }
      afterOk();
      return true;
    } catch (error) {
      return false;
    }
  }

  useEffect(() => {
    loadPermission();
  }, []);

  if (isLoading) {
    return <Spin spinning />;
  }

  return (
    <div>
      {!cannotMes ? <p>{`确认要删除节点"${nodeName}"吗?`}</p> : <p>{cannotMes}</p>}
    </div>
  );
});

export default NodeRemove;
