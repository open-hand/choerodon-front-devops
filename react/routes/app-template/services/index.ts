import { axios } from '@choerodon/boot';
import TemplateApis, { CheckProps } from '@/routes/app-template/apis';

export default class TemplateServices {
  static async handleEnabled(templateId: string, type: string, organizationId?: number) {
    try {
      const res = await axios.get(TemplateApis.templateEnabled(templateId, type, organizationId));
      if (res && res.failed) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static async addTemplatePermission(templateId: string, organizationId?: number) {
    try {
      const res = await axios.get(TemplateApis.addTemplatePermission(templateId, organizationId));
      if (res && res.failed) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static checkNameOrCode({
    type, value, templateId, organizationId,
  }: CheckProps) {
    return axios.get(TemplateApis.checkTemplateNameOrCode({
      type, value, templateId, organizationId,
    }));
  }
}
