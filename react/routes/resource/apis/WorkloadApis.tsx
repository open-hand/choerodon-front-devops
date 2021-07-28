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

  static getWorkLoadJson(
    projectId: number,
    envId: any,
    kind: string,
    name: string,
  ) {
    return `/devops/v1/projects/${projectId}/resources/detail_json?env_id=${envId}&kind=${kind}&name=${name}`;
  }

  static getWorkLoadYaml(
    projectId: number,
    envId: any,
    type: string,
    workloadId: any,
  ) {
    return `/devops/v1/projects/${projectId}/resources/detail_yaml?env_id=${envId}&kind=${type}&name=${workloadId}`;
  }
}
