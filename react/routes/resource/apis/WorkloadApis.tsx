export default class WorkloadApis {
  static getTableData(projectId: number) {
    return `/devops/v1/projects/${projectId}/deployments/paging`;
  }

  static getWorkloadDetail(projectId: number, workloadId: string) {
    return `/devops/v1/projects/${projectId}/`;
  }

  static createWorkload(projectId: number) {
    return `/devops/v1/projects/${projectId}/deployments`;
  }
}
