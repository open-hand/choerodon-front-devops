/* eslint-disable max-len */
import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';
import filter from 'lodash/filter';
import Apis from '@/routes/resource/apis';

export default function useStore() {
  return useLocalStore(() => ({
    autoDeployMsg: {
      existAutoDeploy: false,
      autoDeployStatus: false,
    },

    setAutoDeployMsg(value) {
      this.autoDeployMsg = value;
    },

    async getAutoDeployMsg(envId, projectId) {
      try {
        const res = await Apis.getAutoDeployMsg(envId, projectId);
        if (res && res.failed) {
          return res;
        }
        this.setAutoDeployMsg(res);
        return true;
      } catch (error) {
        throw new Error(error);
      }
    },

    async handleAutoDeployStatus(envId, projectId, refresh) {
      const {
        autoDeployStatus,
      } = this.autoDeployMsg;
      try {
        const res = await (autoDeployStatus ? Apis.closeAutoDeploy(envId, projectId) : Apis.openAutoDeploy(envId, projectId));
        if (res && res.failed) {
          return res;
        }
        this.getAutoDeployMsg(envId, projectId);
        typeof refresh === 'function' && await refresh();
        return res;
      } catch (error) {
        throw new Error(error);
      }
    },

    navBounds: {},
    setNavBounds(data) {
      this.navBounds = data;
    },
    get getNavBounds() {
      return this.navBounds;
    },
  }));
}
