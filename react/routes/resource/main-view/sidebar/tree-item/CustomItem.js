import React, { Fragment, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { Action, axios } from '@choerodon/boot';
import { Icon } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { useResourceStore } from '../../../stores';
import { useMainStore } from '../../stores';
import CustomForm from '../../contents/custom/modals/form-view';
import eventStopProp from '../../../../../utils/eventStopProp';
import openWarnModal from '../../../../../utils/openWarnModal';
import { useTreeItemStore } from './stores';

const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

function CustomItem({
  record,
  name,
  intlPrefix,
  intl: { formatMessage },
}) {
  const {
    treeDs,
    resourceStore: { getSelectedMenu: { itemType, parentId }, setUpTarget, checkExist },
    itemTypes: { CUSTOM_GROUP, CUSTOM_ITEM },
    AppState: { currentMenuType: { projectId } },
  } = useResourceStore();
  const { customStore } = useMainStore();

  const { treeItemStore } = useTreeItemStore();

  function freshTree() {
    treeDs.query();
  }

  function freshMenu() {
    freshTree();
    const [envId] = record.get('parentId').split('**');
    if (itemType === CUSTOM_GROUP && envId === parentId) {
      setUpTarget({
        type: CUSTOM_GROUP,
        id: parentId,
      });
    } else {
      setUpTarget({
        type: CUSTOM_ITEM,
        id: record.get('id'),
      });
    }
  }

  function getEnvIsNotRunning() {
    const [envId] = record.get('parentId').split('**');
    const envRecord = treeDs.find((item) => item.get('key') === envId);
    const connect = envRecord.get('connect');
    return !connect;
  }

  function deleteItem() {
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.custom.delete.title` }, { name: record.get('name') }),
      children: formatMessage({ id: `${intlPrefix}.custom.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
      okProps: { color: 'red' },
      cancelProps: { color: 'dark' },
      onOk: handleDelete,
    });
  }

  async function handleDelete() {
    try {
      await treeItemStore.deleteCustom(projectId, record.get('id'));
      freshTree();
      return true;
    } catch (e) {
      return false;
    }
  }

  function checkDataExist() {
    return checkExist({
      projectId,
      type: 'custom',
      envId: record.get('parentId').split('**')[0],
      id: record.get('id'),
    }).then((isExist) => {
      if (!isExist) {
        openWarnModal(freshTree, formatMessage);
      }
      return isExist;
    });
  }

  function openModal() {
    checkDataExist().then((query) => {
      if (query) {
        Modal.open({
          key: modalKey,
          style: modalStyle,
          drawer: true,
          title: formatMessage({ id: 'resource.edit.header' }),
          children: <CustomForm
            id={record.get('id')}
            envId={record.get('parentId').split('**')[0]}
            type="edit"
            store={customStore}
            refresh={freshMenu}
          />,
          okText: formatMessage({ id: 'save' }),
        });
      }
    });
  }

  function getSuffix() {
    const status = record.get('status');
    const disabled = getEnvIsNotRunning() || status === 'operating';
    if (disabled) {
      return null;
    }
    const actionData = [{
      service: ['choerodon.code.project.deploy.app-deployment.resource.ps.custome-resource.update'],
      text: formatMessage({ id: 'edit' }),
      action: openModal,
    }, {
      service: ['choerodon.code.project.deploy.app-deployment.resource.ps.custom-resource.delete'],
      text: formatMessage({ id: 'delete' }),
      action: deleteItem,
    }];
    return (
      <Action
        placement="bottomRight"
        data={actionData}
        onClick={eventStopProp}
      />
    );
  }

  return (
    <>
      <Icon type="filter_b_and_w" />
      {name}
      {getSuffix()}
    </>
  );
}

CustomItem.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  name: PropTypes.any,
};

CustomItem.defaultProps = {
  name: '',
};

export default injectIntl(observer(CustomItem));
