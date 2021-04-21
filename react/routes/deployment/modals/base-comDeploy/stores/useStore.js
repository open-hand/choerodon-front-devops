import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    pvLabelsList: [],

    get getPvLabelsList() {
      return this.pvLabelsList;
    },

    setPvLabelsList(data) {
      this.pvLabelsList = data;
    },

    envList: [],

    get getEnvList() {
      return this.envList;
    },

    setEnvList(data) {
      this.envList = data;
    },

    mysqlParams: [],

    get getMysqlParams() {
      return this.mysqlParams;
    },

    setMysqlParams(data) {
      this.mysqlParams = data;
    },

    serviceVersionList: [],

    get getServiceVersionList() {
      return this.serviceVersionList;
    },

    setServiceVersionList(data) {
      this.serviceVersionList = data;
    },

    hostList: [],

    get getHostList() {
      return this.hostList;
    },

    setHostList(data) {
      this.hostList = data;
    },

  }));
}
