import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/master';
import moment from 'moment';
import { handlePromptError } from '../../../../../../utils';
import { deployAppCenterApi } from '@/api';
import { formateTime } from '@/utils/formateTime';

export default function useStore({ defaultKey }) {
  return useLocalStore(() => ({
    tabKey: defaultKey || 'cases',
    detailLoading: false,
    detail: {},
    valueLoading: true,
    upgradeValue: {},
    numberData: {}, // 异常与停机次数表数据
    durationData: {}, // 异常与停机持续时长图表数据
    setNumberData(value) {
      this.numberData = value;
    },
    setDurationData(value) {
      this.durationData = value;
    },
    get getNumberData() {
      return this.numberData;
    },
    get getDurationData() {
      return this.durationData;
    },
    setTabKey(data) {
      this.tabKey = data;
    },
    get getTabKey() {
      return this.tabKey;
    },
    setUpgradeValue(value) {
      this.upgradeValue = value;
    },
    get getUpgradeValue() {
      return this.upgradeValue;
    },
    setValueLoading(data) {
      this.valueLoading = data;
    },
    get getValueLoading() {
      return this.valueLoading;
    },

    redeploy(projectId, id) {
      return axios.put(`/devops/v1/projects/${projectId}/app_service_instances/${id}/restart`);
    },

    upgrade(projectId, data, isMarket, isMiddleware) {
      const url = isMiddleware
        ? `/devops/v1/projects/${projectId}/middleware/redis/${data.instanceId}`
        : `/devops/v1/projects/${projectId}/app_service_instances${isMarket ? `/market/instances/${data.instanceId}` : ''}`;
      return axios.put(url, JSON.stringify(data));
    },

    async loadValue(projectId, id, versionId, isMarket = false) {
      this.setValueLoading(true);
      try {
        const url = isMarket
          ? `/devops/v1/projects/${projectId}/app_service_instances/${id}/upgrade_value?market_deploy_object_id=${versionId}`
          : `/devops/v1/projects/${projectId}/app_service_instances/${id}/appServiceVersion/${versionId}/upgrade_value`;
        const data = await axios.get(url);
        const result = handlePromptError(data);
        this.setValueLoading(false);
        if (result) {
          this.setUpgradeValue(data);
          return true;
        }
        return false;
      } catch (e) {
        this.setValueLoading(false);
        Choerodon.handleResponseError(e);
        return false;
      }
    },

    loadUpVersion({
      projectId, appId, page, param = '', init = '',
    }) {
      let url = '';
      if (param) {
        url = `&version=${param}`;
      }
      return axios.post(
        `/devops/v1/projects/${projectId}/app_service_versions/page_by_options?app_service_id=${appId}&deploy_only=true&do_page=true&page=${page}&size=15&app_service_version_id=${init}${url}`,
      );
    },
    async getNumberResult(data) {
      const result = await deployAppCenterApi.getNumber(data);
      this.setNumberData(result);
    },
    async getDurationResult(data) {
      const result = await deployAppCenterApi.getDuration(data);
      result.exceptionDurationList = result.exceptionDurationList?.map((item) => [
        item.date,
        item.durationMinute, '异常',
        moment(item.startTime).format('YYYY-MM-DD HH:mm:ss'), moment(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
        formateTime(item.duration)]);
      result.downTimeDurationList = result.downTimeDurationList?.map((item) => [
        item.date,
        item.durationMinute, '停机', moment(item.startTime).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
        formateTime(item.duration)]);
      this.setDurationData(result);
    },
  }));
}
