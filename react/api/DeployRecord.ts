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

  /**
   * 重试部署记录
   * @param recordId 部署记录ID
   * @param data 参数
   */
  retryRecord(recordId: string, data?: object) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/${recordId}/retry`,
      data,
    });
  }

  /**
   * 停止部署记录
   * @param recordId 部署记录ID
   */
  stopRecord(recordId: string) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/${recordId}/stop`,
    });
  }
}

const deployRecordApi = new DeployRecordApi();
const deployRecordApiConfig = new DeployRecordApi(true);
export { deployRecordApi, deployRecordApiConfig };
