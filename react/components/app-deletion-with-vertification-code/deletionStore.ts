/* eslint-disable max-len */
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
import {
  notificationRecordApi, appServiceInstanceApiConfig, serviceApiConfig, configMapApiConfig, secretApiConfig,
} from '@/api';
import { ingressApiConfig } from '@/api/Ingress';
import { certificationsApiConfig } from '@/api/Certifications';
import { deploymentsApiConfig } from '@/api/Deployments';

type openDeleteProps = {
  envId:string
  instanceId:string
  instanceName:string
  callback:(...args:any[])=>any
  projectId:string
}

function useAppDeletionWithVertificationStore() {
  return useLocalStore(() => ({
    deleteArr: [],
    setDeleteArr(data:any) {
      this.deleteArr = data;
    },
    get getDeleteArr() {
      return this.deleteArr;
    },
    deleteCheck(envId: any, objectType: any) {
      return notificationRecordApi.deleteCheck(envId, objectType);
    },
    sendMessage(envId: any, objectId: any, notificationId: any, objectType: any) {
      return notificationRecordApi.sendMessage(envId, objectId, notificationId, objectType);
    },

    validateCaptcha(envId: any, objectId: any, captcha: any, objectType: any) {
      return notificationRecordApi.validateCache(envId, objectId, captcha, objectType);
    },

    openDeleteModal({
      envId, instanceId, type, callback, instanceName,
    }:Omit<openDeleteProps, 'projectId'> & { type: string}) {
      const newDeleteArr = [...this.deleteArr];

      const currentIndex = findIndex(newDeleteArr, (item:any) => instanceId === item.deleteId && type === item.type);

      if (currentIndex > -1) {
        const newItem = {
          ...newDeleteArr[currentIndex],
          display: true,
          refresh: callback,
        };
        newDeleteArr.splice(currentIndex, 1, newItem);
      } else {
        const newItem = {
          display: true,
          deleteId: instanceId,
          name: instanceName,
          type,
          refresh: callback,
          envId,
        };
        newDeleteArr.push(newItem);
      }
      this.setDeleteArr(newDeleteArr);
    },

    closeDeleteModal(id:openDeleteProps['instanceId'], type:string) {
      const newDeleteArr = [...this.deleteArr];
      const current = find(newDeleteArr, (item) => id === item.deleteId && type === item.type);
      current.display = false;
      this.setDeleteArr(newDeleteArr);
    },

    removeDeleteModal(id:openDeleteProps['instanceId'], type:string) {
      const newDeleteArr = filter(this.deleteArr, ({ deleteId, type: objectType }) => deleteId !== id || objectType !== type);
      this.setDeleteArr(newDeleteArr);
    },

    deleteData(id: any, type: string | number, envId: any) {
      const url:any = {
        instance: appServiceInstanceApiConfig.deleteInstance(id),
        service: serviceApiConfig.deleteInstance(id),
        ingress: ingressApiConfig.deleteInstance(id),
        certificate: certificationsApiConfig.deleteInstance(id),
        configMap: configMapApiConfig.deleteInstance(id),
        secret: secretApiConfig.deleteInstance(envId, id),
        deployGroup: deploymentsApiConfig.deleleDeployGroupApp(id),
      };
      return axios(url[type]);
    },
  }));
}

export {
  useAppDeletionWithVertificationStore,
};

export type AppDeletionWithVertificationStoreProps = ReturnType<typeof useAppDeletionWithVertificationStore>;
