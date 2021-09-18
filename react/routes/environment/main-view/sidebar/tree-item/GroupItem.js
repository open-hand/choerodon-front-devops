import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { Modal } from 'choerodon-ui/pro';
import { Action } from '@choerodon/boot';
import TreeItemName from '../../../../../components/treeitem-name';
import GroupForm from '../../modals/GroupForm';
import { handlePromptError } from '../../../../../utils';
import eventStopProp from '../../../../../utils/eventStopProp';
import { useEnvironmentStore } from '../../../stores';
import { useTreeItemStore } from './stores';

const modalKey = Modal.key();
const confirmKey = Modal.key();

function GroupItem({
  record, search, intl: { formatMessage }, intlPrefix,
}) {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const {
    treeDs,
    envStore,
    AppState: { currentMenuType: { id } },
  } = useEnvironmentStore();
  const { groupFormDs } = useTreeItemStore();

  function handleClick() {
    const groupId = record.get('id');
    const name = record.get('name');
    const { current } = groupFormDs;
    current.set('name', name);
    current.set('id', groupId);
    Modal.open({
      key: modalKey,
      title: formatMessage({ id: `${intlPrefix}.group.edit` }),
      children: <GroupForm dataSet={groupFormDs} treeDs={treeDs} />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: 'save' }),
    });
  }

  async function handleDelete() {
    const groupId = record.get('id');
    try {
      const result = await envStore.deleteGroup(id, groupId);
      handlePromptError(result, false);
    } finally {
      treeDs.query();
    }
  }

  function confirmDelete() {
    const name = record.get('name');
    Modal.open({
      movable: false,
      closable: false,
      key: confirmKey,
      title: `删除分组${name}`,
      children: <div>{formatMessage({ id: `${intlPrefix}.group.delete.warn` })}</div>,
      onOk: handleDelete,
      okText: formatMessage({ id: 'delete' }),
    });
  }

  function getName() {
    const itemName = record.get('name');
    return <TreeItemName headSpace={false} name={itemName} search={search} />;
  }

  function getSuffix() {
    const groupId = record.get('id');
    if (!groupId) return null;

    const actionData = [{
      service: ['choerodon.code.project.deploy.environment.ps.group-modify'],
      text: formatMessage({ id: `${intlPrefix}.modal.group.modify` }),
      action: handleClick,
    }, {
      service: ['choerodon.code.project.deploy.environment.ps.group-delete'],
      text: formatMessage({ id: `${intlPrefix}.modal.group.delete` }),
      action: confirmDelete,
    }];
    return (
      <Action
        placement="bottomRight"
        data={actionData}
        style={{
          marginLeft: 'auto',
        }}
        onClick={eventStopProp}
      />
    );
  }

  return (
    <>
      {getName()}
      {getSuffix()}
    </>
  );
}

GroupItem.propTypes = {
  search: PropTypes.string,
};

GroupItem.defaultProps = {
  search: '',
};

export default injectIntl(observer(GroupItem));
