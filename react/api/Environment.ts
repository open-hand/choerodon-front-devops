import Api from './Api';

class EnvironmentApi extends Api<EnvironmentApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/envs`;
  }

  /**
   * 加载环境列表
   * @param params 额外的接口请求参数
   */

  getCreateEnvDisable() {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_enable_create`,
    });
  }

  loadEnvList(params = {}) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/list_by_active`,
      params: { active: true, ...params || {} },
    });
  }

  // resource_count
  loadResourceCount(id:number | string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${id}/resource_count`,
    });
  }

  // 添加用户权限
  addUserByPermission(envId:string, data:any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/${envId}/permission`,
      data,
    });
  }

  // 删除用户权限
  deleteUserByPermission(id:string, useId:string) {
    return this.request({
      method: 'delete',
      url: `${this.prefix}/${id}/permission?user_id=${useId}`,
    });
  }

  // load permissions data
  loadPermissionsByOpts(id:string, data:any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/${id}/permission/page_by_options`,
      data,
    });
  }

  // list permissions
  loadListsPermission(id:string | number, data:any) {
    return this.request({
      method: 'post',
      data,
      url: `${this.prefix}/${id}/permission/list_non_related`,
    });
  }

  // retry
  envRetry(id:string | number) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${id}/retry`,
    });
  }

  // get error file
  getEnvErrorFiles(id:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${id}/error_file/page_by_env`,
    });
  }

  // env status
  getEnvStatus(id:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${id}/status`,
    });
  }
}

const environmentApiApi = new EnvironmentApi();
const environmentApiConfig = new EnvironmentApi(true);
export { environmentApiApi, environmentApiConfig };
