export default class TreeItemApis {
  static getDisConnectApi(projectId, clusterId) {
    return `/devops/v1/projects/${projectId}/clusters/${clusterId}/disconnection`;
  }
}
