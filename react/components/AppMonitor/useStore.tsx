import { useLocalStore } from 'mobx-react-lite';
import moment from 'moment';
import { deployAppCenterApi } from '@/api';

export default function useStore() {
  return useLocalStore(() => ({
    numberData: {}, // 异常与停机次数表数据
    durationData: {}, // 异常与停机持续时长图表数据
    setNumberData(value: any) {
      this.numberData = value;
    },
    setDurationData(value: any) {
      this.durationData = value;
    },
    get getNumberData() {
      return this.numberData;
    },
    get getDurationData() {
      return this.durationData;
    },
    async getNumberResult(data:any) {
      const result = await deployAppCenterApi.getNumber(data);
      this.setNumberData(result);
    },
    async getDurationResult(data:any) {
      const result = await deployAppCenterApi.getDuration(data);
      const renderXDate = (item:any) => {
        const newArray = item.split('-');
        newArray.splice(0, 1);
        return newArray.join('/');
      };
      result.exceptionDurationList = result.exceptionDurationList?.map((item:any) => [
        renderXDate(item.date),
        item.duration, '异常',
        moment(item.startTime).format('YYYY-MM-DD HH:mm:ss'), moment(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.startTime).format('mm分ss秒')]);
      result.downTimeDurationList = result.downTimeDurationList?.map((item:any) => [
        renderXDate(item.date),
        item.duration, '停机', moment(item.startTime).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.endTime).format('mm分ss秒')]);
      this.setDurationData(result);
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
