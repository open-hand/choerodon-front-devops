export default class AppServiceApis {
  static getTemplateList(projectId: number, selectedLevel: string, randomString: string): string {
    return `/devops/v1/app_template/project/${projectId}/list?selectedLevel=${selectedLevel}&randomString=${randomString}`;
  }

  static createAppServiceByTemplate(projectId: number): string {
    return `/devops/v1/projects/${projectId}/app_service/import/external?is_template=true`;
  }

  static getCheckAdminPermission(projectId: any) {
    return `/iam/choerodon/v1/projects/${projectId}/check_admin_permission`;
  }
}
