import Api from './Api';

class PipelineVariablesApi extends Api<PipelineVariablesApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/pipeline_variables`;
  }

  /**
   * 修改的时候调用的根据流水线ID获取ci变量配置列表
   *
   * @param {string} pipelineID
   * @return {*}
   * @memberof PipelineVariablesApi
   */
  getCiVariasListsWhileModify(pipelineID:string) {
    return this.request({
      url: `${this.prefix}?pipeline_id=${pipelineID}`,
      method: 'get',
    });
  }
}

const pipelineVariablesApi = new PipelineVariablesApi();
const pipelineVariablesApiConfig = new PipelineVariablesApi(true);
export { pipelineVariablesApiConfig, pipelineVariablesApi };
