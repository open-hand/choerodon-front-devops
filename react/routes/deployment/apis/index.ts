export default class DeploymentApi {
  static getEnvList(projectId: number) {
    return `/devops/v1/projects/${projectId}/envs/list_by_active?active=true`;
  }
}
