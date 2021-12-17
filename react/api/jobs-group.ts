import Api from './Api';

class JobsGroupApi extends Api<JobsGroupApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/job_groups`;
  }

  getJobsGroups() {
    return this.request({
      url: `${this.prefix}`,
      method: 'get',
    });
  }
}

const jobsGroupApi = new JobsGroupApi();
const jobsGroupApiConfig = new JobsGroupApi(true);
export { jobsGroupApi, jobsGroupApiConfig };
