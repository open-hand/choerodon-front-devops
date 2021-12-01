/* eslint-disable import/no-anonymous-default-export */
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import JSONBigint from 'json-bigint';

function formatData({ data, expandsKeys }) {
  const newData = [];
  function flatData(value, gitlabProjectId, parentId) {
    forEach(value, (item) => {
      const key = `${parentId ? `${parentId}-` : ''}${item.id || item.devopsPipelineRecordRelId}`;
      const newGitlabProjectId = item.gitlabProjectId || gitlabProjectId;
      const newItem = {
        ...item,
        key,
        parentId: parentId ? parentId.toString() : null,
        status: item.latestExecuteStatus || item.status || (item.ciStatus === 'success' && item.cdStatus ? item.cdStatus : item.ciStatus),
        expand: expandsKeys?.indexOf(key) > -1,
        gitlabProjectId: newGitlabProjectId,
      };
      newData.push(newItem);
    });
  }
  flatData(data);
  return newData;
}

export default ({
  projectId, mainStore, editBlockStore, handleSelect, DEFAULT_SIZE,
}) => ({
  autoCreate: false,
  autoQuery: false,
  selection: 'single',
  primaryKey: 'key',
  idField: 'key',
  parentField: 'parentId',
  expandField: 'expand',
  pageSize: DEFAULT_SIZE,
  transport: {
    read: ({ dataSet }) => ({
      url: `devops/v1/projects/${projectId}/cicd_pipelines/query?page=${mainStore.getTreeDataPage || 1}&size=${DEFAULT_SIZE}${mainStore.getSearchValue ? `&searchParam=${mainStore.getSearchValue}` : ''}`,
      method: 'post',
      data: null,
      transformResponse(response) {
        try {
          const data = JSONBigint.parse(response);
          if (data && data.failed) {
            return data;
          }
          const { getExpandedKeys, setExpandedKeys } = mainStore;
          let expandsKeys = getExpandedKeys;
          const newData = [...data.content];
          if (isEmpty(getExpandedKeys) && newData.length) {
            const newKeys = newData[0].id.toString();
            expandsKeys = [newKeys];
            setExpandedKeys([newKeys]);
          }
          mainStore.setTreeDataHasMore(data.totalElements > 0
            && (data.number + 1) < data.totalPages);
          return formatData({
            data: newData,
            expandsKeys,
          });
        } catch (e) {
          return response;
        }
      },
    }),
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/cicd_pipelines/${data.id}`,
      method: 'delete',
    }),
  },
  events: {
    select: ({ record, previous }) => {
      handleSelect(record, mainStore);
    },
    unSelect: ({ record }) => {
      // 禁用取消选中
      // eslint-disable-next-line no-param-reassign
      record.isSelected = true;
    },
    load: ({ dataSet }) => {
      const records = mainStore.getTreeData;
      if (mainStore.getTreeDataPage > 1) {
        dataSet.unshift(...records);
      }
      mainStore.setTreeData(dataSet.records);

      function selectFirstRecord() {
        const newRecord = dataSet.records[0];
        if (newRecord) {
          newRecord.isSelected = true;
          handleSelect(newRecord, mainStore);
        }
      }

      mainStore.setPageList({});
      const { key } = mainStore.getSelectedMenu;
      if (key) {
        const selectedRecord = dataSet.find((treeRecord) => key === treeRecord.get('key'));
        if (selectedRecord) {
          selectedRecord.isSelected = true;
          handleSelect(selectedRecord, mainStore);
        }
        // const pattern = new URLSearchParams(window.location.hash);
        // const newPipelineId = pattern.get('pipelineId');
        // const newPipelineIdRecordId = pattern.get('pipelineIdRecordId');
        // if (selectedRecord) {
        //   selectedRecord.isSelected = true;
        //   handleSelect(selectedRecord, mainStore);
        // } else if (!newPipelineId || !newPipelineIdRecordId) {
        //   selectFirstRecord();
        // }
      } else {
        selectFirstRecord();
      }
    },
  },
});
