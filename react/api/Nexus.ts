import Api from './Api';

class NexusApi extends Api<NexusApi> {
  get prefix() {
    return `/devops/v1/nexus/choerodon/${this.orgId}/project/${this.projectId}/nexus`;
  }

  getServerList() {
    return this.request({
      method: 'get',
      url: `${this.prefix}/server/list`,
    });
  }
}

const nexusApi = new NexusApi();
const nexusApiConfig = new NexusApi(true);
export { nexusApi, nexusApiConfig };
