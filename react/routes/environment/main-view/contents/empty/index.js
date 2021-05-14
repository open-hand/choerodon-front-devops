import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import GroupForm from '../../modals/GroupForm';
import { useEnvironmentStore } from '../../../stores';
import { useMainStore } from '../../stores';

const groupKey = Modal.key();

const EmptyPage = observer(() => {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const {
    intlPrefix,
    intl: { formatMessage },
    treeDs,
  } = useEnvironmentStore();
  const { groupFormDs } = useMainStore();

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
    });
  }

  function getButtons() {
    return [{
      permissions: ['choerodon.code.project.deploy.environment.ps.group-create'],
      name: formatMessage({ id: `${intlPrefix}.group.create` }),
      icon: 'playlist_add',
      handler: openGroupModal,
      display: true,
    }];
  }

  return <HeaderButtons items={getButtons()} showClassName />;
});

export default EmptyPage;
