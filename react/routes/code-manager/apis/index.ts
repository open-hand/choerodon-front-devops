export default class CodeManagerApis {
  static loadProjectData(organizationId: string, userId: string) {
    return `/iam/choerodon/v1/organizations/${organizationId}/users/${userId}/projects/paging?enabled=true`;
  }

  static loadSummaryData(projectId: string) {
    return `/agile/v1/projects/${projectId}/issues/summary`;
  }
}
