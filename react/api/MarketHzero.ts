import { axios } from '@choerodon/boot';
import { getProjectId, getOrganizationId } from '@/utils/common';
import Api from './Api';

class MarketHzeroApi extends Api<MarketHzeroApi> {
  get sitePrefix() {
    return '/market/v1/market/application';
  }

  get orgPrefix() {
    return `/market/v1/organizations/${this.orgId}/market/application/hzero`;
  }

  get prefix() {
    return `/market/v1/projects/${this.projectId}/market/application/hzero`;
  }

  /**
   * 加载HZERO应用同步状态
   */
  loadSyncStatus() {
    return this.request({
      method: 'get',
      url: `${this.sitePrefix}/hzero/sync_status`,
    });
  }

  /**
   * 加载HZERO应用版本
   * @param type HZERO应用类型 open/sass
   */
  loadHzeroVersions(type = 'open') {
    return this.request({
      method: 'get',
      url: `${this.sitePrefix}/hzero`,
      params: { type },
    });
  }

  /**
   * 加载HZERO服务
   * @param applicationId
   * @param appVersionId
   */
  loadHzeroServices(applicationId: string, appVersionId: string) {
    return this.request({
      method: 'get',
      url: `${this.sitePrefix}/deploy_object/hzero`,
      params: {
        application_id: applicationId,
        app_version_id: appVersionId,
      },
    });
  }
}

const marketHzeroApi = new MarketHzeroApi();
const marketHzeroApiConfig = new MarketHzeroApi(true);
export { marketHzeroApi, marketHzeroApiConfig };
