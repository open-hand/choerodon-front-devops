/* eslint-disable max-len */
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';

type openDeleteProps = {
  envId:string
  instanceId:string
  instanceName:string
  callback:(...args:any[])=>any
  projectId:string
}

export default function useStore() {
  return useLocalStore(() => ({
    deleteArr: [],
    setDeleteArr(data:any) {
      this.deleteArr = data;
    },
    get getDeleteArr() {
      return this.deleteArr;
    },
    deleteCheck(projectId: any, envId: any, objectType: any) {
      return axios.get(`/devops/v1/projects/${projectId}/notification/check_delete_resource?env_id=${envId}&object_type=${objectType}`);
    },
    sendMessage(projectId: any, envId: any, objectId: any, notificationId: any, objectType: any) {
      return axios.get(`/devops/v1/projects/${projectId}/notification/send_message?env_id=${envId}&object_id=${objectId}&notification_id=${notificationId}&object_type=${objectType}`);
    },

    validateCaptcha(projectId: any, envId: any, objectId: any, captcha: any, objectType: any) {
      return axios.get(`/devops/v1/projects/${projectId}/notification/validate_captcha?env_id=${envId}&object_id=${objectId}&captcha=${captcha}&object_type=${objectType}`);
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
    deleteData(projectId: any, id: any, type: string | number, envId: any) {
      const url:any = {
        instance: `/devops/v1/projects/${projectId}/app_service_instances/${id}/delete`,
        service: `/devops/v1/projects/${projectId}/service/${id}`,
        ingress: `/devops/v1/projects/${projectId}/ingress/${id}`,
        certificate: `/devops/v1/projects/${projectId}/certifications?cert_id=${id}`,
        configMap: `/devops/v1/projects/${projectId}/config_maps/${id}`,
        secret: `/devops/v1/projects/${projectId}/secret/${envId}/${id}`,
      };
      return axios.delete(url[type]);
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
