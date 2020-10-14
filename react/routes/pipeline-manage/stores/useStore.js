import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import { handlePromptError } from '../../../utils';

export default function useStore({ DEFAULT_SIZE }) {
  return useLocalStore(() => ({
    navBounds: {},
    setNavBounds(data) {
      this.navBounds = data;
    },
    get getNavBounds() {
      return this.navBounds;
    },

    selectedMenu: {},
    setSelectedMenu(data) {
      this.selectedMenu = data;
    },
    get getSelectedMenu() {
      return this.selectedMenu;
    },

    expandedKeys: [],
    setExpandedKeys(keys) {
      this.expandedKeys = keys;
    },
    get getExpandedKeys() {
      return this.expandedKeys.slice();
    },

    searchValue: '',
    setSearchValue(value) {
      this.searchValue = value;
    },
    get getSearchValue() {
      return this.searchValue;
    },

    pageList: {},
    get getPageList() {
      return this.pageList;
    },
    setPageList(data) {
      this.pageList = data;
    },

    treeDataHasMore: false,
    get getTreeDataHasMore() {
      return this.treeDataHasMore;
    },
    setTreeDataHasMore(flag) {
      this.treeDataHasMore = flag;
    },

    treeDataPage: 1,
    get getTreeDataPage() {
      return this.treeDataPage;
    },
    setTreeDataPage(data) {
      this.treeDataPage = data;
    },

    treeDataPageSize: DEFAULT_SIZE,
    get getTreeDataPageSize() {
      return this.treeDataPageSize;
    },
    setTreeDataPageSize(data) {
      this.treeDataPageSize = data;
    },

    async changeRecordExecute({
      projectId, gitlabProjectId, recordId, type, devopsPipelineRecordRelId,
    }) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/cicd_pipelines_record/${type}?gitlab_project_id=${gitlabProjectId}&gitlab_pipeline_id=${recordId}${devopsPipelineRecordRelId ? `&record_rel_id=${devopsPipelineRecordRelId}` : ''}`);
        return handlePromptError(res);
      } catch (e) {
        Choerodon.handleResponseError(e);
        return false;
      }
    },

    async changePipelineActive({ projectId, pipelineId, type }) {
      try {
        const res = await axios.put(`/devops/v1/projects/${projectId}/cicd_pipelines/${pipelineId}/${type}`);
        return handlePromptError(res);
      } catch (e) {
        Choerodon.handleResponseError(e);
        return false;
      }
    },

    checkLinkToGitlab(projectId, appServiceId, type) {
      return axios.get(`/devops/v1/projects/${projectId}/member-check/${appServiceId}?type=${type || 'CI_PIPELINE_DETAIL'}`);
    },

    /**
     ** 人工审核阶段或任务
     * @param projectId
     * @param cdRecordId
     * @param stageRecordId
     * @param result
     */
    auditStage({
      projectId, cdRecordId, stageRecordId, result,
    }) {
      return axios.post(`devops/v1/projects/${projectId}/pipeline_records/${cdRecordId}/stage_records/${stageRecordId}/audit?result=${result}`);
    },

    /**
     ** 人工审核阶段或任务
     * @param projectId
     * @param cdRecordId
     * @param stageRecordId
     * @param jobRecordId
     * @param result
     */
    auditJob({
      projectId, cdRecordId, stageRecordId, jobRecordId, result,
    }) {
      return axios.post(`/devops/v1/projects/${projectId}/pipeline_records/${cdRecordId}/stage_records/${stageRecordId}/job_records/${jobRecordId}/audit?result=${result}`);
    },

    /**
     ** 人工审核预检，判断是否可以审核
     * @param projectId
     * @param cdRecordId
     * @param data
     */
    canCheck(projectId, cdRecordId, data) {
      return axios.post(`/devops/v1/projects/${projectId}/pipeline_records/${cdRecordId}/check_audit_status`, JSON.stringify(data));
    },
  }));
}
