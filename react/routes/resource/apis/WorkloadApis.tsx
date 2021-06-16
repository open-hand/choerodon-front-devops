export default class WorkloadApis {
  static getTableData(projectId: number, urlType: string) {
    return `/devops/v1/projects/${projectId}/${urlType}/paging`;
  }

  static getWorkloadDetail(projectId: number) {
    return `/devops/v1/projects/${projectId}/resources/yaml`;
  }

  static createWorkload(projectId: number, urlType: string) {
    return `/devops/v1/projects/${projectId}/${urlType}`;
  }

  static deleteWorkload(projectId: number, urlType: string) {
    return `/devops/v1/projects/${projectId}/${urlType}`;
  }

  static operatePodCount(projectId: number) {
    return `devops/v1/projects/${projectId}/app_service_instances/operate_pod_count`;
  }
}
