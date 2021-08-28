import Api from './Api';

class SecretApi extends Api<SecretApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/service`;
  }

  deleteInstance(envId:string, id:string) {
    return this.request({
      url: `${this.prefix}/${envId}/${id}`,
      method: 'delete',
    });
  }
}

const secretApi = new SecretApi();
const secretApiConfig = new SecretApi(true);
export { secretApi, secretApiConfig };
