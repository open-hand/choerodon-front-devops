import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { axios, Choerodon } from '@choerodon/master';
import { FormattedMessage } from 'react-intl';
import { handlePromptError } from '@/utils';

const redeployKey = Modal.key();

type RedeployProps = {
  projectId:string,
  appServiceId:string
  refresh?:(...args:any[])=>any
}

function redeploy(projectId:string, id:string) {
  return axios.put(`/devops/v1/projects/${projectId}/app_service_instances/${id}/restart`);
}

async function handleRedeploy({
  projectId,
  appServiceId,
  refresh,
}:RedeployProps) {
  try {
    const result = await redeploy(projectId, appServiceId);
    if (handlePromptError(result, false)) {
      typeof refresh === 'function' && refresh();
    }
  } catch (e) {
    Choerodon.handleResponseError(e);
  }
}

function openRedeploy({
  commandVersion,
  projectId,
  refresh,
  appServiceId,
}:{
  commandVersion:string,
} & RedeployProps) {
  Modal.open({
    key: redeployKey,
    title: '重新部署',
    children: <FormattedMessage id="c7ncd.deployment.modal.redeploy.tips" values={{ versionName: commandVersion }} />,
    onOk: () => handleRedeploy({
      refresh,
      projectId,
      appServiceId,
    }),
  });
}

export {
  openRedeploy,
};
