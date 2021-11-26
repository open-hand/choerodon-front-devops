export default class CodeManagerApis {
  static loadProjectData(organizationId: string, userId: string, projectId?: string) {
    return `/iam/choerodon/v1/organizations/${organizationId}/users/${userId}/projects/paging?enabled=true${projectId ? `&project_id=${projectId}` : ''}`;
  }

  static loadSummaryData(projectId: string, page:number) {
    return `/agile/v1/projects/${projectId}/issues/summary?page=${page}&size=${10}`;
  }
}
