export interface OperateProps {
  projectId: number,
  envId: string,
  name: string,
  count: number,
}

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

  static operatePodCount({
    projectId, envId, name, count,
  }: OperateProps) {
    return `devops/v1/projects/${projectId}/app_service_instances/operate_pod_count?envId=${envId}&name=${name}&count=${count}`;
  }
}
