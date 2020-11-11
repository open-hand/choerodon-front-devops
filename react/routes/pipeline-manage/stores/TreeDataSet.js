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
        expand: expandsKeys.indexOf(key) > -1,
        gitlabProjectId: newGitlabProjectId,
      };
      newData.push(newItem);
      if (!isEmpty(item.ciCdPipelineRecordVOS)) {
        flatData(item.ciCdPipelineRecordVOS, newGitlabProjectId, item.id);
      }
      if (item.hasMoreRecords) {
        newData.push({
          key: `${item.id}-more`,
          parentId: item.id.toString(),
        });
      }
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
  paging: true,
  transport: {
    read: ({ dataSet }) => ({
      url: `devops/v1/projects/${projectId}/cicd_pipelines/query?page=${mainStore.getTreeDataPage || 1}&size=${mainStore.getTreeDataPage === 1 ? mainStore.getTreeDataPageSize : DEFAULT_SIZE}`,
      method: 'post',
      transformResponse(response) {
        try {
          const data = JSONBigint.parse(response);
          if (data && data.failed) {
            return data;
          }
          const { getExpandedKeys, setExpandedKeys } = mainStore;
          let expandsKeys = getExpandedKeys;
          let newData = [...data.content];
          if (isEmpty(getExpandedKeys) && newData.length) {
            const newKeys = newData[0].id.toString();
            expandsKeys = [newKeys];
            setExpandedKeys([newKeys]);
          }
          let newFormatData = formatData({
            data: [...data.content],
            expandsKeys,
          });
          if (data.number > 0 && dataSet) {
            newData = [...dataSet.toData(), ...data.content];
            newFormatData = [...dataSet.toData(), ...newFormatData];
          }
          mainStore.setTreeDataHasMore(data.totalElements > 0
            && (data.number + 1) < data.totalPages);
          return newFormatData;
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
      // eslint-disable-next-line no-param-reassign
      dataSet.pageSize = 13;
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
        const pattern = new URLSearchParams(window.location.hash);
        const newPipelineId = pattern.get('pipelineId');
        const newPipelineIdRecordId = pattern.get('pipelineIdRecordId');
        if (selectedRecord) {
          selectedRecord.isSelected = true;
          handleSelect(selectedRecord, mainStore);
        } else if (!newPipelineId || !newPipelineIdRecordId) {
          selectFirstRecord();
        }
      } else {
        selectFirstRecord();
      }
    },
  },
});
