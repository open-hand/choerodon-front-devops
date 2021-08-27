import Api from './Api';

class NotificationRecordApi extends Api<NotificationRecordApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/notification`;
  }

  // 删除校验
  deleteCheck(envId:string | number, objectType:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_delete_resource?env_id=${envId}&object_type=${objectType}`,
    });
  }

  // 发送消息
  sendMessage(envId:string, objectId:string, notificationId:string, objectType:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/send_message?env_id=${envId}&object_id=${objectId}&notification_id=${notificationId}&object_type=${objectType}`,
    });
  }

  // 检验短信验证缓存
  validateCache(envId:string, objectId:string, captcha:string, objectType:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/validate_captcha?env_id=${envId}&object_id=${objectId}&captcha=${captcha}&object_type=${objectType}`,
    });
  }
}

const notificationRecordApi = new NotificationRecordApi();
const notificationRecordApiConfig = new NotificationRecordApi(true);
export { notificationRecordApi, notificationRecordApiConfig };
