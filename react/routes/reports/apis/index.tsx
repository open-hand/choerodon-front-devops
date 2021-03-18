export default class ReportsApis {
  static getAllPipeline(projectId: number) {
    return `devops/v1/projects/${projectId}/cicd_pipelines/devops/pipeline`;
  }

  static getPipelineDurationChart(projectId: number, startTime: string, endTime: string) {
    return `/devops/v1/projects/${projectId}/cicd_pipelines/execute/time?start_time=${startTime}&end_time=${endTime}`;
  }

  static getPipelineDurationTable(projectId: number, startTime: string, endTime: string) {
    return `/devops/v1/projects/${projectId}/cicd_pipelines/execute/time/page?start_time=${startTime}&end_time=${endTime}`;
  }
}
