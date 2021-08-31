import Api from './Api';

class RdupmApi extends Api<RdupmApi> {
  get getProjectId() {
    return this.projectId;
  }

  get getOrgId() {
    return this.orgId;
  }

  getProjectImageRepo() {
    return this.request({
      method: 'get',
      url: '/rdupm/v1/harbor-choerodon-repos/listImageRepo',
      params: {
        projectId: this.projectId,
      },
    });
  }

  getImages(repoId: string, repoType: string) {
    return this.request({
      method: 'get',
      url: '/rdupm/v1/harbor-choerodon-repos/listHarborImage',
      params: {
        repoId,
        repoType,
      },
    });
  }

  getImageVersion(repoName: string, imageName: string) {
    return this.request({
      method: 'get',
      url: `/rdupm/v1/harbor-image-tag/list/${this.getProjectId}/`,
      params: {
        repoName: `${repoName}/${imageName}`,
      },
    });
  }

  getMavenList(configId: any) {
    return this.request({
      method: 'get',
      url: `/rdupm/v1/nexus-repositorys/choerodon/${this.getOrgId}/project/${this.getProjectId}/repo/maven/list`,
      params: {
        configId,
      },
    });
  }

  getGroupId(repositoryId: string) {
    return this.request({
      method: 'get',
      url: `/rdupm/v1/nexus-repositorys/choerodon/${this.getOrgId}/project/${this.getProjectId}/repo/maven/groupId`,
      params: {
        repositoryId,
      },
    });
  }

  getArtifactId(repositoryId: string) {
    return this.request({
      method: 'get',
      url: `/rdupm/v1/nexus-repositorys/choerodon/${this.getOrgId}/project/${this.getProjectId}/repo/maven/artifactId`,
      params: {
        repositoryId,
      },
    });
  }

  getJarVersion({
    artifactId,
    groupId,
    repositoryId,
    repositoryName,
  }: any) {
    return this.request({
      method: 'get',
      url: `/rdupm/v1/nexus-components/${this.getOrgId}/project/${this.getProjectId}`,
      params: {
        name: artifactId,
        group: groupId,
        repositoryId,
        repositoryName,
      },
    });
  }
}

const rdupmApiApi = new RdupmApi();
const rdupmApiApiConfig = new RdupmApi(true);
export { rdupmApiApi, rdupmApiApiConfig };
