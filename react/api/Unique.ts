/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import Api from './Api';

class UniqueApi extends Api<UniqueApi> {
  getOptionalService() {
    return this.request({
      method: 'get',
      url: `/market/v1/optional/service/${this.orgId}/synced/service`,
    });
  }
}

const uniqueApi = new UniqueApi();
const uniqueApiConfig = new UniqueApi(true);

export { uniqueApi, uniqueApiConfig };
