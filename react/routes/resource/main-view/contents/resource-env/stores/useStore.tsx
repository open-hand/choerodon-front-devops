import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import checkPermission from '@/utils/checkPermission';
import { handlePromptError } from '@/utils';

export default function useStore({ defaultTab }:any) {
  return useLocalStore(() => ({
    tabKey: defaultTab,

    setTabKey(data: any) {
      this.tabKey = data;
    },
    get getTabKey() {
      return this.tabKey;
    },
    hasPermission: false,
    setPermission(data: any) {
      this.hasPermission = data;
    },
    get getPermission() {
      return this.hasPermission;
    },

    hasInstance: false,
    setHasInstance(data: any) {
      this.hasInstance = data;
    },
    get getHasInstance() {
      return this.hasInstance;
    },

    polarisLoading: true,
    setPolarisLoading(flag: any) {
      this.polarisLoading = flag;
    },
    get getPolarisLoading() {
      return this.polarisLoading;
    },

    async checkPermission({ projectId, organizationId }:any) {
      // @ts-expect-error
      const res = await checkPermission({
        code: 'choerodon.code.project.deploy.app-deployment.resource.ps.permission',
        organizationId,
        projectId,
      });
      this.setPermission(res);
    },

    checkDelete(projectId: any, id: any) {
      return axios.get(`/devops/v1/projects/${projectId}/deploy_value/check_delete?value_id=${id}`);
    },
    deleteRecord(projectId: any, id: any) {
      return axios.delete(`/devops/v1/projects/${projectId}/deploy_value?value_id=${id}`);
    },

    async checkHasInstance(projectId: any, envId: any) {
      try {
        this.setPolarisLoading(true);
        const res = await axios.get(`devops/v1/projects/${projectId}/app_service_instances/count_by_options?env_id=${envId}&status=&app_service_id=`);
        const result = handlePromptError(res);
        this.setHasInstance(result);
        this.setPolarisLoading(false);
        return result;
      } catch (e) {
        Choerodon.handleResponseError(e);
        this.setPolarisLoading(false);
        return false;
      }
    },

    async ManualScan(projectId: any, envId: any) {
      try {
        const res = await axios.post(`/devops/v1/projects/${projectId}/polaris/envs/${envId}`);
        const result = handlePromptError(res);
        return result;
      } catch (e) {
        Choerodon.handleResponseError(e);
        return false;
      }
    },
  }));
}
