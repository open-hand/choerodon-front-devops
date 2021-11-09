import Api from './Api';

class CiJobs extends Api<CiJobs> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/ci_jobs`;
  }

  getCiPipelineLogs(gitlabProjectId:string, gitlabJobId:string, appServiceId:string) {
    return this.request({
      url: `${this.prefix}/gitlab_projects/${gitlabProjectId}/gitlab_jobs/${gitlabJobId}/trace?app_service_id=${appServiceId}`,
      method: 'get',
    });
  }
}

const ciJobsApi = new CiJobs();
const ciJobsApiConfig = new CiJobs(true);
export { ciJobsApi, ciJobsApiConfig };
