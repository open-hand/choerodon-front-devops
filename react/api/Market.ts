import Api from './Api';

class MarketApi extends Api<MarketApi> {
  get prefix() {
    return `/devops/v1/project/${this.projectId}/market`;
  }

  Import(res:any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/app/import`,
      data: res,
    });
  }
}

const marketApi = new MarketApi();
const marketApiConfig = new MarketApi(true);
export { marketApi, marketApiConfig };
