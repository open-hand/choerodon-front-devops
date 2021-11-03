import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';
import map from 'lodash/map';

export default function useStore(mainStore) {
  return useLocalStore(() => ({
    mainStore: [],
    get getMainData() {
      this.setMainSource();
      return this.mainStore;
    },
    setMainSource() {
      this.mainStore.stageList = this.dataSource;
    },

    setMainData(value) {
      this.mainStore = value;
    },

    loading: true,
    setLoading(value) {
      this.loading = value;
    },
    get getLoading() {
      return this.loading;
    },

    loadData(projectId, pipelineId) {
      this.setLoading(true);
      this.loadDetail(projectId, pipelineId).then((res) => {
        if (res) {
          const { id: selectedId } = mainStore.getSelectedMenu;
          if (selectedId === pipelineId) {
            const tempArr = res.devopsCiStageVOS.concat(res.devopsCdStageVOS);
            this.setStepData(tempArr);
            this.setViewData(tempArr);
            this.setMainData(res);
          }
          this.setLoading(false);
        }
      });
    },

    loadDetail(projectId, pipelineId) {
      return axios.get(`/devops/v1/projects/${projectId}/cicd_pipelines/${pipelineId}`);
    },
    dataSource: [],
    viewData: [],

    setViewData(value) {
      this.viewData = value;
    },

    get getViewData() {
      return this.viewData?.slice();
    },

    setStepData(value) {
      this.dataSource = value;
    },
    get getStepData() {
      return this.dataSource?.slice();
    },

    addNewStep(index, data) {
      const { cdAuditUserIds } = data;
      const stepObj = {
        ...data,
        cdAuditUserIds: cdAuditUserIds && cdAuditUserIds.map((x) => (typeof x === 'object' ? x.id : x)),
        name: data.step,
        jobList: [],
      };
      this.dataSource.splice(index + 1, 0, stepObj);
      this.dataSource = this.dataSource.map((item, i) => {
        const newItem = item;
        newItem.sequence = i;
        return newItem;
      });
    },

    removeStep(sequence) {
      this.dataSource.forEach((item, index) => {
        if (item.sequence === sequence) {
          this.dataSource.splice(index, 1);
          return true;
        }
        return false;
      });
      this.dataSource = this.dataSource.map((item, i) => {
        const newItem = item;
        newItem.sequence = i;
        return newItem;
      });
    },
    eidtStep(sequence, newName, curType) {
      this.dataSource.forEach((item, index) => {
        if (item.sequence === sequence) {
          this.dataSource[index].name = newName;
          this.dataSource[index].type = curType;
          return true;
        }
        return false;
      });
    },
    editStepLists(lists) {
      this.dataSource = [...lists];
    },
    newJob(sequence, data) {
      this.dataSource.forEach((item, index) => {
        if (item.sequence === sequence) {
          // eslint-disable-next-line no-param-reassign
          data.sequence = this.dataSource[index].jobList.length;
          if (this.dataSource[index]?.jobList.length) {
            this.dataSource[index].jobList.push(data);
          } else {
            this.dataSource[index].jobList = [data];
          }
        }
      });
    },
    editJob(sequence, key, data) {
      this.dataSource.forEach((item, index) => {
        if (item.sequence === sequence) {
          this.dataSource[index].jobList[key] = { ...data };
        }
      });
    },
    editJobLists(sequence, type, jobList) {
      if (type === 'CD') {
        const tempArr = map(jobList, (item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.sequence = index;
          return item;
        });
        this.dataSource[sequence].jobList = [...tempArr];
        return;
      }
      this.dataSource[sequence].jobList = [...jobList];
    },
    removeStepTask(sequence, key) {
      this.dataSource.forEach((item, index) => {
        if (item.sequence === sequence) {
          this.dataSource[index].jobList.splice(key, 1);
        }
      });
    },
  }));
}
