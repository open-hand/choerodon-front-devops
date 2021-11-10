import Api from './Api';

class PipeLineRecords extends Api<PipeLineRecords> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/pipeline_records`;
  }

  getCdPipelineLogs(cdRecordId:string, stageRecordId:string, jobRecordId:string) {
    return this.request({
      url: `${this.prefix}/runner_guide/${cdRecordId}/stage_records/${stageRecordId}/job_records/log/${jobRecordId}`,
      method: 'get',
    });
  }
}

const pipeLineRecordsApi = new PipeLineRecords();
const pipeLineRecordsApiConfig = new PipeLineRecords(true);
export { pipeLineRecordsApi, pipeLineRecordsApiConfig };
