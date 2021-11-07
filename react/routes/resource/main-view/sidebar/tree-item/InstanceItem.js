import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { Action, Choerodon, axios } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import isEmpty from 'lodash/isEmpty';
import eventStopProp from '@/utils/eventStopProp';
import PodCircle from '@/components/pod-circle';
import { useResourceStore } from '../../../stores';
import { useTreeItemStore } from './stores';
import {
  openDelete,
} from '@/components/app-deletion-with-vertification-code';
import { handlePromptError } from '@/utils';
import { useMainStore } from '../../stores';
import openWarnModal from '@/utils/openWarnModal';

const stopKey = Modal.key();
const stopKey2 = Modal.key();

function InstanceItem({
  record,
  name,
  podColor: {
    RUNNING_COLOR,
    PADDING_COLOR,
  },
  intlPrefix,
  intl: { formatMessage },
}) {
  const {
    treeDs,
    resourceStore,
    AppState: { currentMenuType: { id } },
    itemTypes: { IST_GROUP },
    AppState: { currentMenuType: { projectId } },
  } = useResourceStore();
  const { treeItemStore } = useTreeItemStore();
  const {
    deletionStore,
  } = useMainStore();

  const podRunningCount = record.get('podRunningCount');
  const podCount = record.get('podCount');
  const podUnlinkCount = podCount - podRunningCount;
  const podData = useMemo(() => [{
    name: 'running',
    value: podRunningCount,
    stroke: RUNNING_COLOR,
  }, {
    name: 'unlink',
    value: podUnlinkCount,
    stroke: PADDING_COLOR,
  }], [podUnlinkCount, podRunningCount, podCount]);

  function freshTree() {
    treeDs.query();
  }

  function freshMenu() {
    freshTree();
    const { getSelectedMenu: { itemType, parentId } } = resourceStore;
    const [envId] = record.get('parentId').split('**');
    if (itemType === IST_GROUP && envId === parentId) {
      resourceStore.setUpTarget({
        type: IST_GROUP,
        id: parentId,
      });
    }
  }

  function checkDataExist() {
    return resourceStore.checkExist({
      projectId,
      type: 'instance',
      envId: record.get('parentId').split('**')[0],
      id: record.get('id'),
    }).then((isExist) => {
      if (!isExist) {
        openWarnModal(freshTree, formatMessage);
      }
      return isExist;
    });
  }

  function checkPipelineReference() {
    return treeItemStore.checkPipelineReference({
      projectId,
      instanceId: record.get('id'),
    });
  }

  function openPipelineReferenceModal(active, hasPipelineReference) {
    Modal.open({
      movable: false,
      closable: false,
      key: stopKey2,
      title: formatMessage({ id: `${intlPrefix}.instance.action.${active}.title` }, { name: record.get('name') }),
      children: formatMessage({ id: `${intlPrefix}.instance.action.${active}.no.tips` }, { ...hasPipelineReference }),
      okCancel: false,
      okText: formatMessage({ id: 'iknow' }),
    });
  }

  async function openChangeActive(active) {
    const [isExist, hasPipelineReference] = await axios.all([
      checkDataExist(),
      active === 'stop' ? checkPipelineReference() : null,
    ]);
    if (isExist) {
      if (!isEmpty(hasPipelineReference)) {
        openPipelineReferenceModal(active, hasPipelineReference);
      } else {
        Modal.open({
          movable: false,
          closable: false,
          key: stopKey,
          title: formatMessage({ id: `${intlPrefix}.instance.action.${active}.title` }, { name: record.get('name') }),
          children: formatMessage({ id: `${intlPrefix}.instance.action.${active}.tips` }),
          onOk: () => handleChangeActive(active),
        });
      }
    }
  }

  async function handleChangeActive(active) {
    try {
      const istId = record.get('id');
      const result = await treeItemStore.changeIstActive(id, istId, active);
      if (handlePromptError(result, false)) {
        treeDs.query();
        resourceStore.setUpTarget({
          type: 'instances',
          id: istId,
        });
      }
    } catch (error) {
      Choerodon.handleResponseError(error);
    }
  }

  function getSuffix() {
    const istId = record.get('id');
    const istName = record.get('name');
    const [envId] = record.get('parentId').split('**');
    const envRecord = treeDs.find((eachRecord) => eachRecord.get('key') === envId);
    const connect = envRecord && envRecord.get('connect');
    if (!connect) {
      return;
    }
    let actionData;
    const actionItems = {
      stop: {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.stop'],
        text: formatMessage({ id: `${intlPrefix}.instance.action.stop` }),
        action: () => openChangeActive('stop'),
      },
      start: {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.start'],
        text: formatMessage({ id: `${intlPrefix}.instance.action.start` }),
        action: () => openChangeActive('start'),
      },
      delete: {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete'],
        text: formatMessage({ id: `${intlPrefix}.instance.action.delete` }),
        action: () => openDelete({
          envId,
          instanceId: istId,
          instanceName: istName,
          callback: freshMenu,
          projectId,
          deletionStore,
        }),
      },
    };
    switch (record.get('status')) {
      case 'running':
        actionData = [actionItems.stop, actionItems.delete];
        break;
      case 'stopped':
        actionData = [actionItems.start, actionItems.delete];
        break;
      case 'failed':
        actionData = [actionItems.delete];
        break;
      default:
        break;
    }

    return actionData ? (
      <Action
        placement="bottomRight"
        data={actionData}
        onClick={eventStopProp}
      />
    ) : null;
  }

  return (
    <>
      <PodCircle
        size="small"
        dataSource={podData}
      />
      {name}
      {getSuffix()}
    </>
  );
}

InstanceItem.propTypes = {
  name: PropTypes.any,
  podColor: PropTypes.shape({}),
};

export default injectIntl(observer(InstanceItem));
