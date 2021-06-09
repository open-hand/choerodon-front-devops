export default class WorkloadApis {
  static getTableData(projectId: number, envId: string) {
    return `/devops/v1/projects/${projectId}/`;
  }

  static getWorkloadDetail(projectId: number, workloadId: string) {
    return `/devops/v1/projects/${projectId}/`;
  }

  static createWorkload(projectId: number, envId: string) {
    return `/devops/v1/projects/${projectId}/`;
  }

  static updateWorkload(projectId: number, workloadId: string) {
    return `/devops/v1/projects/${projectId}/`;
  }
}
