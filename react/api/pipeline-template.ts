import Api from './Api';

class PipelinTemplateApi extends Api<PipelinTemplateApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/pipeline_templates`;
  }

  getPipelineTemplate() {
    return this.request({
      url: `${this.prefix}`,
      method: 'get',
    });
  }

  /**
   * 根据ID查具体的模板数据
   * @param {(string | number)} id
   * @return {*}
   * @memberof PipelinTemplateApi
   */
  getTemplateDataById(id:string | number) {
    return this.request({
      url: `${this.prefix}/${id}`,
      method: 'get',
    });
  }
}

const pipelinTemplateApi = new PipelinTemplateApi();
const pipelinTemplateApiConfig = new PipelinTemplateApi(true);
export { pipelinTemplateApi, pipelinTemplateApiConfig };
