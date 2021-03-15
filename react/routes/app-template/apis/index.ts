export interface CheckProps {
  value: string,
  type: string,
  templateId?: string,
  organizationId?: number,
}

function getApiUrl(organizationId?: number) {
  return organizationId
    ? `/devops/v1/app_template/organization/${organizationId}`
    : '/devops/v1/app_template/site';
}

export default class TemplateApis {
  static getTemplateTable(organizationId?: number): string {
    return `${getApiUrl(organizationId)}`;
  }

  static templateEnabled(templateId: string, type: string, organizationId?: number): string {
    return `${getApiUrl(organizationId)}/${type}/${templateId}`;
  }

  static deleteTemplate(templateId: string, organizationId?: number): string {
    return `${getApiUrl(organizationId)}/${templateId}`;
  }

  static getTemplateDetail(templateId: string, organizationId?: number): string {
    return `${getApiUrl(organizationId)}/${templateId}`;
  }

  static getTemplateList(organizationId?: number): string {
    return `${getApiUrl(organizationId)}/list`;
  }

  static checkTemplateNameOrCode({
    type, value, templateId, organizationId,
  }: CheckProps): string {
    return `${getApiUrl(organizationId)}/check_name_or_code?type=${type}&value=${value}${templateId ? `&app_template_id=${templateId}` : ''}`;
  }

  static createTemplate(organizationId?: number): string {
    return `${getApiUrl(organizationId)}/create_template`;
  }

  static updateTemplateName(templateId: string, name: string, organizationId?: number): string {
    return `${getApiUrl(organizationId)}/update_template/${templateId}?name=${name}`;
  }

  static addTemplatePermission(templateId: string, organizationId?: number): string {
    return `${getApiUrl(organizationId)}/add_permission/${templateId}`;
  }
}
