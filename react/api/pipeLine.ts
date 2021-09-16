import Api from './Api';

class PipeLine extends Api<PipeLine> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/cicd_pipelines`;
  }

  getParams() {
    return this.request({
      url: `${this.prefix}/runner_guide`,
      method: 'get',
    });
  }
}

const pipeLineApi = new PipeLine();
const pipeLineApiConfig = new PipeLine(true);
export { pipeLineApi, pipeLineApiConfig };
