import Api from './Api';

class CiCdPipelineApi extends Api<CiCdPipelineApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/cicd_pipelines`;
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
