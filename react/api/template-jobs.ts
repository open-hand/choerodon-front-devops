import Api from './Api';

class TemplateJobsApi extends Api<TemplateJobsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/template_jobs`;
  }

  getJobByGroupId(id:string|number) {
    return this.request({
      url: `${this.prefix}?group_id=${id}`,
      method: 'get',
    });
  }
}

const templateJobsApi = new TemplateJobsApi();
const templateJobsApiConfig = new TemplateJobsApi(true);
export { templateJobsApi, templateJobsApiConfig };
