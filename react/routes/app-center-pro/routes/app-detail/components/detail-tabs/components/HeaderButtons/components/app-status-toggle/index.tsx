import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { axios, Choerodon } from '@choerodon/master';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import openWarnModal from '@/utils/openWarnModal';
import { handlePromptError } from '@/utils';

const stopKey = Modal.key();
const stopKey2 = Modal.key();

type activeType = 'stop' | 'start' | 'delete';

type CheckActveProps = {
  projectId:string,
  instanceId:string,
  active: activeType,
  callback:CallableFunction
}

type CheckDataExistProps ={
  projectId:string,
  envId:string,
  instanceId:string,
  callback:CallableFunction,
}

async function checkPipelineReference({ projectId, instanceId }:Pick<CheckActveProps, 'projectId' | 'instanceId'>) {
  try {
    const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/pipeline_reference`);
    if (res && res.pipelineName) {
      return res;
    }
    // 实例没有关联的应用流水线时返回false
    return false;
  } catch (e) {
    return false;
  }
}

function changeIstActive({
  projectId, instanceId, active,
}:CheckActveProps) {
  return axios.put(
    `devops/v1/projects/${projectId}/app_service_instances/${instanceId}/${active}`,
  );
}

async function checkExist({
  projectId, envId, type, instanceId,
}:Omit<CheckDataExistProps, 'callback'> & {
  type:string,
}) {
  try {
    const res = await axios.get(`/devops/v1/projects/${projectId}/envs/${envId}/check?type=${type}&object_id=${instanceId}`);
    if (typeof res === 'boolean') {
      return res;
    }
    // 只有请求到false，才返回false
    return true;
  } catch (e) {
    return true;
  }
}

function checkDataExist({
  projectId,
  envId,
  callback,
  instanceId,
}:CheckDataExistProps) {
  return checkExist({
    projectId,
    type: 'instance',
    envId,
    instanceId,
  }).then((isExist) => {
    if (!isExist) {
      openWarnModal(callback);
    }
    return isExist;
  });
}

async function handleChangeActive({
  active,
  instanceId,
  projectId,
  callback,
}:CheckActveProps) {
  try {
    const result = await changeIstActive({
      projectId, instanceId, active, callback,
    });
    if (handlePromptError(result, false)) {
      callback && callback();
      // resourceStore.setUpTarget({
      //   type: 'instances',
      //   id: instanceId,
      // });
    }
  } catch (error) {
    Choerodon.handleResponseError(error);
  }
}

function openPipelineReferenceModal({
  active, hasPipelineReference, name,
}:{
  active: activeType,
  name:string,
  hasPipelineReference:any
}) {
  Modal.open({
    movable: false,
    closable: false,
    key: stopKey2,
    title: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.title`} values={{ name }} />,
    children: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.no.tips`} values={{ ...hasPipelineReference }} />,
    okCancel: false,
    okText: <FormattedMessage id="iknow" />,
  });
}

// async function openDelete({
//   envId, instanceId, intanceName, callback, projectId, name,
// }:{
//   projectId:string,
//   envId:string,
//   instanceId:string,
//   intanceName:string,
//   callback:CallableFunction,
//   name:string,
// }) {
//   const hasPipelineReference = await checkPipelineReference({
//     projectId,
//     instanceId,
//   });
//   if (!isEmpty(hasPipelineReference)) {
//     openPipelineReferenceModal({ active: 'delete', name, hasPipelineReference });
//   } else {
//     openDeleteModal(envId, instanceId, intanceName, 'instance', callback);
//   }
// }

export async function openChangeActive({
  active,
  name,
  projectId,
  callback,
  envId,
  instanceId,
}:{
  name:string,
} & CheckDataExistProps & CheckActveProps) {
  const [isExist, hasPipelineReference] = await axios.all([
    checkDataExist({
      projectId,
      envId,
      callback,
      instanceId,
    }),
    active === 'stop' ? checkPipelineReference({
      projectId,
      instanceId,
    }) : null,
  ]);
  if (isExist) {
    if (!isEmpty(hasPipelineReference)) {
      openPipelineReferenceModal({
        active, hasPipelineReference, name,
      });
    } else {
      Modal.open({
        movable: false,
        closable: false,
        key: stopKey,
        title: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.title`} values={{ name }} />,
        children: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.tips`} />,
        onOk: () => handleChangeActive({
          active,
          instanceId,
          projectId,
          callback,
        }),
      });
    }
  }
}
