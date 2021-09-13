import Api from './Api';

class HzeroGetYaml extends Api<HzeroGetYaml> {
  get prefix() {
    return '';
  }

  getCurrentVersionYaml(instansceId:string) {
    return this.request({
      url: `/devops/v1/projects/${this.projectId}/app_service_instances/${instansceId}/values`,
      method: 'get',
    });
  }

  getOtherVersionYaml(instansceId:string, id:string) {
    return this.request({
      url: `/devops/v1/projects/${this.projectId}/app_service_instances/${instansceId}/market_value?market_deploy_object_id=${id}`,
      method: 'get',
    });
  }
}

const HzeroGetYamlApi = new HzeroGetYaml();
const HzeroGetYamlApiConfig = new HzeroGetYaml(true);
export { HzeroGetYamlApi, HzeroGetYamlApiConfig };
