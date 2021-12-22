import Api from './Api';

class CiTemplatesVariablesApi extends Api<CiTemplatesVariablesApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/ci_template_variables`;
  }

  /**
   * 创建的时候调用的根据模板ID获取ci变量配置的模板
   * @param {string} templateId
   * @return {*}
   * @memberof CiTemplatesVariablesApi
   */
  getCiVariasListsWhileCreate(templateId:string) {
    return this.request({
      url: `${this.prefix}?template_id=${templateId}`,
      method: 'get',
    });
  }
}

const ciTemplatesVariablesApi = new CiTemplatesVariablesApi();
const ciTemplatesVariablesApiConfig = new CiTemplatesVariablesApi(true);
export { ciTemplatesVariablesApi, ciTemplatesVariablesApiConfig };
