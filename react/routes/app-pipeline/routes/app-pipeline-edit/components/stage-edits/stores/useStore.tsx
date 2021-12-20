import { useLocalStore } from 'mobx-react-lite';
import useTabData from '../../../hooks/useTabData';

export default function useStore() {
  const [savedData = []] = useTabData<any[]>();

  return useLocalStore((sourceData) => ({
    sourceData,
    setStagesData(value:any) {
      this.sourceData = value;
    },

    /**
   * 添加阶段
   * @param {number} stageIndex
   */
    addStage(stageIndex:number, stageData:Record<string, any>) {
      this.sourceData.splice(stageIndex, 0, stageData);
    },
    get getSourceData() {
      return this.sourceData;
    },
  }), savedData);
}

export type StoreProps = ReturnType<typeof useStore>;
