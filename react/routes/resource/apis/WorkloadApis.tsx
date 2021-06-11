export default class WorkloadApis {
  static getTableData(projectId: number) {
    return `/devops/v1/projects/${projectId}/deployments/paging`;
  }

  static getWorkloadDetail(projectId: number) {
    return `/devops/v1/projects/${projectId}/resources/yaml`;
  }

  static createWorkload(projectId: number) {
    return `/devops/v1/projects/${projectId}/deployments`;
  }
}
