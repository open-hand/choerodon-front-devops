import Api from './Api';

class SecretApi extends Api<SecretApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/secret`;
  }

  deleteInstance(envId:string, id:string) {
    return this.request({
      url: `${this.prefix}/${envId}/${id}`,
      method: 'delete',
    });
  }

  loadSingleData(id:string) {
    return this.request({
      url: `${this.prefix}/${id}?to_decode=true`,
      method: 'get',
    });
  }

  putSecret(data:any) {
    return this.request({
      url: `${this.prefix}`,
      data,
      method: 'put',
    });
  }

  postSecret(data:any) {
    return this.request({
      url: `${this.prefix}`,
      data,
      method: 'post',
    });
  }

  checkName(envId:string, secretName:string) {
    return this.request({
      url: `${this.prefix}/${envId}/check_name?secret_name=${secretName}`,
      method: 'get',
    });
  }
}

const secretApi = new SecretApi();
const secretApiConfig = new SecretApi(true);
export { secretApi, secretApiConfig };
