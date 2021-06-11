import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';
import WorkloadApis, { OperateProps } from '@/routes/resource/apis/WorkloadApis';

export default function useStore({ DEPLOYMENT_TAB }: { DEPLOYMENT_TAB: string }) {
  return useLocalStore(() => ({
    tabKey: DEPLOYMENT_TAB,

    setTabKey(data: string) {
      this.tabKey = data;
    },
    get getTabKey() {
      return this.tabKey;
    },

    operatePodCount({
      projectId, envId, name, count,
    }: OperateProps) {
      return axios.put(WorkloadApis.operatePodCount({
        projectId, envId, name, count,
      }));
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
