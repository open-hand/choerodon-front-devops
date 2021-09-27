import Api from './Api';

class MiddlewareApi extends Api<MiddlewareApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/middleware`;
  }

  upgradeApp(res:any, appId:string) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/redis/${appId}`,
      data: res,
    });
  }

  updateMiddleware(instanceId: string, data: any) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/${instanceId}`,
      data,
    });
  }

  updateHost(data: any) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/host/update`,
      data,
    });
  }
}

const middlewareApi = new MiddlewareApi();
const middlewareConfigApi = new MiddlewareApi(true);
export { middlewareApi, middlewareConfigApi };
