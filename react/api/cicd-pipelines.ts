import Api from './Api';

class CiCdPipelineApi extends Api<CiCdPipelineApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/cicd_pipelines`;
  }

  /**
   * 创建流水线
   * @param {*} data
   * @return {*}
   * @memberof CiCdPipelineApi
   */
  handlePipelineCreate(data:any) {
    return this.request({
      url: `${this.prefix}`,
      data,
      method: 'post',
    });
  }

  /**
   * 修改流水线
   * @param {string} pipelineId
   * @param {*} data
   * @return {*}
   * @memberof CiCdPipelineApi
   */
  handlePipelineModify(pipelineId:string, data:any) {
    return this.request({
      url: `${this.prefix}/${pipelineId}`,
      data,
      method: 'put',
    });
  }

  /**
   *
   * @param {string} pipelineId
   * @return {*}
   * @memberof CiCdPipelineApi
   */
  getTemplatesWhileEdits(pipelineId:string | number) {
    return this.request({
      url: `${this.prefix}/${pipelineId}`,
      method: 'get',
    });
  }
}

const ciCdPipelineApi = new CiCdPipelineApi();
const ciCdPipelineApiConfig = new CiCdPipelineApi(true);
export { ciCdPipelineApiConfig, ciCdPipelineApi };
