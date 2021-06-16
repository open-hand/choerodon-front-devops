import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';
import WorkloadApis from '@/routes/resource/apis/WorkloadApis';

interface OperateProps {
  projectId: number,
  envId: string,
  name: string,
  count: number,
  kind: string,
}

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
      projectId, envId, name, count, kind,
    }: OperateProps) {
      return axios({
        method: 'put',
        url: WorkloadApis.operatePodCount(projectId),
        params: {
          envId,
          name,
          count,
          kind,
        },
      });
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
