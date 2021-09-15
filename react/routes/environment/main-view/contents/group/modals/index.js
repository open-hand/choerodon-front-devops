import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import EnvCreateForm from '../../../modals/env-create';
import GroupForm from '../../../modals/GroupForm';
import { useEnvironmentStore } from '../../../../stores';
import { useMainStore } from '../../../stores';
import { useEnvGroupStore } from '../stores';
import { environmentApiApi } from '@/api/Environment';

const groupKey = Modal.key();
const envKey = Modal.key();

const GroupModal = observer((props) => {
  const [createEnvDisable, setCreateEnvDisable] = useState(true);
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const {
    intlPrefix,
    intl: { formatMessage },
    treeDs,
  } = useEnvironmentStore();
  const { groupFormDs } = useMainStore();
  const { groupDs } = useEnvGroupStore();

  useEffect(() => {
    const {
      location: { state },
    } = props;

    if (state && state.openCreate) {
      openEnvModal();
    }
    environmentApiApi.getCreateEnvDisable().then((res) => {
      if (res) {
        setCreateEnvDisable(!res);
      }
    });
  }, []);

  const refresh = () => {
    groupDs.query();
    treeDs.query();
  };

  function openGroupModal() {
    Modal.open({
      key: groupKey,
      title: formatMessage({ id: `${intlPrefix}.group.create` }),
      children: <GroupForm dataSet={groupFormDs} treeDs={treeDs} />,
      drawer: true,
      style: modalStyle,
      afterClose: () => {
        groupFormDs.current.reset();
      },
      okText: formatMessage({ id: 'create' }),
    });
  }

  function openEnvModal() {
    Modal.open({
      key: envKey,
      title: formatMessage({ id: `${intlPrefix}.create` }),
      children: <EnvCreateForm intlPrefix={intlPrefix} refresh={refresh} />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: 'create' }),
    });
  }

  function getButtons() {
    let tooltipsConfig = {};
    if (createEnvDisable) {
      tooltipsConfig = {
        title: '集群环境数量已达上限,无法创建更多环境',
      };
    }
    return [{
      permissions: ['choerodon.code.project.deploy.environment.ps.group-add-env'],
      name: formatMessage({ id: `${intlPrefix}.create` }),
      icon: 'playlist_add',
      handler: openEnvModal,
      display: true,
      disabled: createEnvDisable,
      tooltipsConfig,
    }, {
      permissions: ['choerodon.code.project.deploy.environment.ps.group-create'],
      name: formatMessage({ id: `${intlPrefix}.group.create` }),
      icon: 'playlist_add',
      handler: openGroupModal,
      display: true,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }];
  }

  return (
    <div>
      <HeaderButtons items={getButtons()} showClassName />
    </div>
  );
});

export default withRouter(GroupModal);
