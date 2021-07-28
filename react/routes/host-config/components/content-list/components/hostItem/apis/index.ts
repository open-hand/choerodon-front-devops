export default class HostItemApis {
  static getDisConnectApi(projectId: string | number) {
    return `/devops/v1/projects/${projectId}/hosts/disconnection`;
  }
}
