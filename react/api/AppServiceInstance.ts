import Api from './Api';

type DeploymentJsonType = 'deploymentVOS'| 'statefulSetVOS' |'daemonSetVOS'

class AppServiceInstanceApi extends Api<AppServiceInstanceApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_service_instances`;
  }

  /**
   * 校验实例名称唯一性
   * @param envId 环境id
   * @param instanceName 实例名称
   */
  checkName(envId: string, instanceName: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name`,
      params: {
        instance_name: instanceName,
        env_id: envId,
      },
    });
  }

  createAppServiceInstance(data: any) {
    return this.request({
      method: 'post',
      url: this.prefix,
      data,
    });
  }

  updateAppServiceInstance(data: any) {
    return this.request({
      method: 'put',
      url: this.prefix,
      data,
    });
  }

  getDeployValue(versionId: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/deploy_value`,
      params: {
        type: 'create',
        version_id: versionId,
      },
    });
  }

  createMarketAppService(data: any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/market/instances`,
      data,
    });
  }

  updateMarketAppService(instanceId: string, data: any) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/market/instances/${instanceId}`,
      data,
    });
  }

  // 删除实例
  deleteInstance(id:string) {
    return this.request({
      url: `${this.prefix}/${id}/delete`,
      method: 'delete',
    });
  }

  // 校验pipeline
  checkPipelineReference(instanceId:string) {
    return this.request({
      url: `${this.prefix}/${instanceId}/pipeline_reference`,
      method: 'get',
    });
  }

  // deployment JSON
  loadDeploymentsJson(type:DeploymentJsonType, name:string, instance:string) {
    const URL_TYPE:{
      [fields in DeploymentJsonType]:string
    } = {
      deploymentVOS: `deployment_detail_json?deployment_name=${name}`,
      statefulSetVOS: `stateful_set_detail_json?stateful_set_name=${name}`,
      daemonSetVOS: `daemon_set_detail_json?daemon_set_name=${name}`,
    };
    return this.request({
      url: `${this.prefix}/${instance}/${URL_TYPE[type]}`,
      method: 'get',
    });
  }

  // deployment yarml
  loadDeploymentsYaml(type:DeploymentJsonType, name:string, instance:string) {
    const URL_TYPE:{
      [fields in DeploymentJsonType]:string
    } = {
      deploymentVOS: `deployment_detail_yaml?deployment_name=${name}`,
      statefulSetVOS: `stateful_set_detail_yaml?stateful_set_name=${name}`,
      daemonSetVOS: `daemon_set_detail_yaml?daemon_set_name=${name}`,
    };
    return this.request({
      url: `${this.prefix}/${instance}/${URL_TYPE[type]}`,
      method: 'get',
    });
  }

  // opreate pods count
  operatePodCount(name: string, num: string, kind: string, envId:string) {
    return this.request({
      url: `${this.prefix}/operate_pod_count?envId=${envId}&name=${name}&count=${num}&kind=${kind}`,
      method: 'put',
    });
  }

  getValues(instanceId: string, appServiceVersionId: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${instanceId}/appServiceVersion/${appServiceVersionId}/upgrade_value`,
    });
  }

  getMarketValues(instanceId: string, deployObjectId?: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${instanceId}/upgrade_value`,
      params: {
        market_deploy_object_id: deployObjectId,
      },
    });
  }
}

const appServiceInstanceApi = new AppServiceInstanceApi();
const appServiceInstanceApiConfig = new AppServiceInstanceApi(true);
export { appServiceInstanceApi, appServiceInstanceApiConfig };
