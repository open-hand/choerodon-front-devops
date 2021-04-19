import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
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
