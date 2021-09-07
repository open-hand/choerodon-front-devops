import Api from './Api';

class MiddlewareApi extends Api<MiddlewareApi> {
  get prefix() {
    return `/devops/v1/project/${this.projectId}/middleware`;
  }

  upgradeApp(res:any, appId:string) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/redis/${appId}`,
      data: res,
    });
  }
}

const middlewareApi = new MiddlewareApi();
const middlewareConfigApi = new MiddlewareApi(true);
export { middlewareApi, middlewareConfigApi };
