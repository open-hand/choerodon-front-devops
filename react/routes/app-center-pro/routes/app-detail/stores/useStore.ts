import { useLocalStore } from 'mobx-react-lite';
import moment from 'moment';
import { deployAppCenterApi } from '@/api';
import { formateTime } from '@/utils/formateTime';

export default function useStore() {
  return useLocalStore(() => ({
    currentTabKey: 'application_event',
    numberData: {}, // 异常与停机次数表数据
    durationData: {}, // 异常与停机持续时长图表数据
    setNumberData(value:any) {
      this.numberData = value;
    },
    setDurationData(value:any) {
      this.durationData = value;
    },
    get getNumberData() {
      return this.numberData;
    },
    get getDurationData() {
      return this.durationData;
    },
    setCurrentTabKey(value:string) {
      this.currentTabKey = value;
    },
    async getNumberResult(data:any) {
      const result = await deployAppCenterApi.getNumber(data);
      this.setNumberData(result);
    },
    async getDurationResult(data:any) {
      const result = await deployAppCenterApi.getDuration(data);
      result.exceptionDurationList = result.exceptionDurationList?.map((item:any) => [
        item.date,
        item.durationMinute, '异常',
        moment(item.startTime).format('YYYY-MM-DD HH:mm:ss'), moment(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
        formateTime(item.duration)]);
      result.downTimeDurationList = result.downTimeDurationList?.map((item:any) => [
        item.date,
        item.durationMinute, '停机', moment(item.startTime).format('YYYY-MM-DD HH:mm:ss'),
        moment(item.endTime).format('YYYY-MM-DD HH:mm:ss'),
        formateTime(item.duration)]);
      this.setDurationData(result);
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
