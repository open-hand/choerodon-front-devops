import { useLocalStore } from 'mobx-react-lite';
import { handlePromptError } from '@/utils';
import { configMapApi, secretApi } from '@/api';
import { keyValueType } from '../interface';

export default function useStore(type?:keyValueType) {
  return useLocalStore(() => ({
    singleData: {},
    setSingleData(data:object) {
      this.singleData = data;
    },
    get getSingleData() {
      return this.singleData;
    },

    async loadSingleData(id:string) {
      const res = type === 'secret' ? await secretApi.loadSingleData(id) : await configMapApi.loadSingleData(id);
      if (handlePromptError(res)) {
        this.setSingleData(res);
      }
      return res;
    },

    postKV(data:any) {
      const { id } = data;
      const stringData = JSON.stringify(data);
      if (id) {
        return type === 'secret' ? secretApi.putSecret(stringData) : configMapApi.putConfigMap(stringData);
      }
      return type === 'secret' ? secretApi.postSecret(stringData) : configMapApi.postConfigMap(stringData);
    },

    checkName(envId:string, name:string) {
      return type === 'secret' ? secretApi.checkName(envId, name) : configMapApi.checkName(envId, name);
    },
  }));
}

export type FormStoreType = ReturnType<typeof useStore>;
