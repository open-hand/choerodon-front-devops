/* eslint-disable max-len */
import { message } from 'choerodon-ui';
import { useLocalStore } from 'mobx-react-lite';
import useTabData from '../../../hooks/useTabData';

export default function useStore() {
  const [savedData = [], setSavedData] = useTabData<any[]>();

  const stores = useLocalStore((sourceData) => ({
    sourceData,
    setStagesData(value:any) {
      this.sourceData = value;
      setSavedData(sourceData.slice());
    },
    get getSourceData() {
      return this.sourceData;
    },

    handleEditCallback() {
      setSavedData(this.sourceData.slice());
    },

    /**
       * 新增，删除阶段重新排序
       * @return {*}
       */
    handleStageSequenceSort() {
      const sortData = this.sourceData.slice().map((item:any, sequence:number) => ({ ...item, sequence }));
      this.sourceData = sortData;
    },

    /**
       * 新增，删除job重新排序
       * @return {*}
       */
    handleJobSequenceSort(stageIndex:number) {
      const sortData = this.sourceData[stageIndex]?.jobList.map((item:any, sequence:number) => ({ ...item, sequence }));
      this.sourceData[stageIndex].jobList = sortData;
    },

    /**
       * 添加阶段
       * @param {number} stageIndex
       */
    addStage(stageIndex:number, stageData:Record<string, any>) {
      this.sourceData.splice(stageIndex, 0, stageData);
      this.handleStageSequenceSort();

      this.handleEditCallback();
    },

    /**
       * 编辑阶段
       * @param {number} stageIndex
       * @param {Record<string, any>} stageData
       */
    editStage(stageIndex:number, stageData:Record<string, any>) {
      this.sourceData[stageIndex] = { ...this.sourceData[stageIndex], ...stageData };
      this.handleEditCallback();
    },

    /**
       * 删除阶段
       * @param {number} stageIndex
       */
    deleteStage(stageIndex:number) {
      this.sourceData.splice(stageIndex, 1);

      this.handleStageSequenceSort();
      this.handleEditCallback();
    },

    /**
       * 阶段排序
       * @param {number} from
       * @param {number} to
       */
    orderStage(from:number, to:number) {
      this.sourceData.splice(to, 0, this.sourceData.splice(from, 1)[0]);

      this.handleStageSequenceSort();
      this.handleEditCallback();
    },

    /**
       * 添加job
       * @param {number} stageIndex
       * @param {number} jobIndex
       * @param {*} jobData
       */
    addJob(stageIndex:number, jobIndex:number, jobData:any) {
      if (!this.sourceData[stageIndex]?.jobList) {
        this.sourceData[stageIndex].jobList = [jobData];
      } else {
        this.sourceData[stageIndex].jobList.splice(jobIndex, 0, jobData);
      }

      this.handleJobSequenceSort(stageIndex);
      this.handleEditCallback();
    },

    /**
       * 编辑job
       * @param {number} stageIndex
       * @param {number} jobIndex
       * @param {*} jobData
       * @return {boolean} 是否添加成功
       */
    editJob(stageIndex:number, jobIndex:number, jobData:any) {
      if (!this.sourceData[stageIndex]?.jobList) {
        return;
      }
      // const isJobNameRepeated = this.sourceData[stageIndex].jobList?.some((job: { name: string; }) => job.name === jobData?.name);
      // if (isJobNameRepeated) {
      //   isJobNameRepeated && message.error('当前阶段存在同名的任务！');
      //   return false;
      // }
      this.sourceData[stageIndex].jobList[jobIndex] = jobData;
      this.handleJobSequenceSort(stageIndex);
      this.handleEditCallback();
    },

    /**
       * 删除job
       * @param {number} stageIndex
       * @param {number} jobIndex
       * @return {*}
       */
    deleteJob(stageIndex:number, jobIndex:number) {
      if (!this.sourceData[stageIndex]?.jobList) {
        return;
      }
      this.sourceData[stageIndex].jobList.splice(jobIndex, 1);

      this.handleJobSequenceSort(stageIndex);
      this.handleEditCallback();
    },

  }), savedData);

  return stores;
}

export type StoreProps = ReturnType<typeof useStore>;
