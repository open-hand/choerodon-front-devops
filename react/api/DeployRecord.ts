import Api from './Api';

class DeployRecordApi extends Api<DeployRecordApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_record`;
  }

  /**
   * 查询部署记录详情
   * @param recordId 部署记录ID
   */
  loadRecordDetail(recordId: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${recordId}`,
    });
  }
}

const deployRecordApi = new DeployRecordApi();
const deployRecordApiConfig = new DeployRecordApi(true);
export { deployRecordApi, deployRecordApiConfig };
