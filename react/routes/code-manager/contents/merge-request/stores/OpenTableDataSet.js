/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import React from 'react';
import Tips from '../../../../../components/new-tips';

export default ((projectId, formatMessage, mergedRequestStore, appId, tabKey, format) => {
  function changeCount(count) {
    mergedRequestStore.setCount(count);
  }

  return {
    selection: null,
    autoQuery: false,
    paging: true,
    transport: {
      read: {
        method: 'get',
        transformResponse: (response) => {
          try {
            if (!response) {
              mergedRequestStore.setIsEmpty(true);
              return response;
            }
            mergedRequestStore.setIsEmpty(false);
            const data = JSON.parse(response);
            if (data && data.failed) {
              return data;
            }
            const {
              closeCount, mergeCount, openCount, totalCount, auditCount, mergeRequestVOPageInfo,
            } = data;
            changeCount({
              closeCount,
              mergeCount,
              openCount,
              totalCount,
              auditCount,
            });
            return mergeRequestVOPageInfo;
          } catch (e) {
            return response;
          }
        },
      },
    },
    fields: [
      { name: 'title', type: 'string', label: formatMessage({ id: 'app.name' }) },
      { name: 'iid', type: 'string', label: <Tips title={format({ id: 'ID' })} helpText={formatMessage({ id: 'app.code.tip' })} /> },
      { name: 'state', type: 'string', label: format({ id: 'state' }) },
      { name: 'targetBranch', type: 'string', label: <Tips title={formatMessage({ id: 'app.branch' })} helpText={formatMessage({ id: 'app.branch.tip' })} /> },
      { name: 'createdAt', type: 'string', label: <Tips title={formatMessage({ id: 'boot.create' })} helpText={formatMessage({ id: 'create.tip' })} /> },
      { name: 'commits', type: 'string', label: <Tips title={format({ id: 'Commits' })} helpText={formatMessage({ id: 'merge.commit.tip' })} /> },
      { name: 'updatedAt', type: 'string', label: format({ id: 'UpdateTime' }) },
      { name: 'assignee', type: 'string', label: format({ id: 'Assignee' }) },
    ],
  };
});
