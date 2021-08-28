import Api from './Api';

class GroupsApi extends Api<GroupsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/groups`;
  }

  getGroups() {
    return this.request({
      method: 'get',
      url: `${this.prefix}/owned_expect_current`,
    });
  }
}

const groupsApi = new GroupsApi();
const groupsApiConfig = new GroupsApi(true);
export { groupsApi, groupsApiConfig };
