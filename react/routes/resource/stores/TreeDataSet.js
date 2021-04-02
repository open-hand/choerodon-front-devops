import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import forEach from 'lodash/forEach';
import moment from 'moment';
import setEnvRecentItem from '../../../utils/setEnvRecentItem';
import {
  itemTypeMappings, viewTypeMappings, RES_TYPES, ENV_KEYS,
} from './mappings';

const { IST_VIEW_TYPE, RES_VIEW_TYPE } = viewTypeMappings;
const { ENV_ITEM, APP_ITEM, IST_ITEM } = itemTypeMappings;

function formatResource({ value, expandsKeys, formatMessage }) {
  if (isEmpty(value)) return [];
  const flatted = [];
  forEach(value, (node, key) => {
    const envInfo = pick(node, ENV_KEYS);
    const envId = envInfo.id;
    const envKey = String(envId);
    flatted.push({
      ...envInfo,
      key: envKey,
      itemType: ENV_ITEM,
      expand: expandsKeys.includes(envKey),
      parentId: '0',
      childrenData: omit(node, ENV_KEYS),
      isLeaf: false,
    });
  });

  return flatted;
}

function formatInstance({ value, expandsKeys }) {
  if (isEmpty(value)) return [];
  const flatted = [];
  function flatData(data, prevKey = '', itemType = ENV_ITEM) {
    forEach(data, (node) => {
      const children = node.apps;
      const peerNode = omit(node, ['apps']);
      const key = prevKey ? `${prevKey}**${node.id}` : String(node.id);

      flatted.push({
        ...peerNode,
        name: node.name || node.code,
        expand: expandsKeys.includes(key),
        parentId: prevKey || '0',
        itemType,
        key,
        childrenData: !isEmpty(children) ? children : null,
        isLeaf: isEmpty(children),
      });
    });
  }
  flatData(value);
  return flatted;
}

function handleSelect({
  record, store, projectId, organizationId, projectName,
}) {
  if (record) {
    const data = record.toData();
    store.setSelectedMenu(data);
    const item = getParentRecord(record);
    if (item && item.itemType === ENV_ITEM) {
      const recentEnv = {
        ...item,
        projectId,
        organizationId,
        projectName,
        clickTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      setEnvRecentItem({ value: recentEnv });
    }
  }
}

function getParentRecord(record) {
  if (record.parent) {
    return getParentRecord(record.parent);
  }
  return record.toData();
}

export default ({
  store, type, projectId, formatMessage, organizationId, projectName,
}) => {
  const formatMaps = {
    [IST_VIEW_TYPE]: formatInstance,
    [RES_VIEW_TYPE]: formatResource,
  };
  const urlMaps = {
    [IST_VIEW_TYPE]: `/devops/v1/projects/${projectId}/envs/ins_tree_menu`,
    [RES_VIEW_TYPE]: `/devops/v1/projects/${projectId}/envs/resource_tree_menu`,
  };
  return {
    autoQuery: true,
    paging: false,
    dataKey: null,
    selection: 'single',
    parentField: 'parentId',
    expandField: 'expand',
    idField: 'key',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'key', type: 'string' },
      { name: 'parentId', type: 'string' },
      { name: 'itemType', type: 'string' },
    ],
    events: {
      query: () => {
        // 请求数据前清空已加载子节点的key,确保展开的子节点获取最新数据
        store.setLoadedKeys([]);
        return true;
      },
      load: ({ dataSet }) => {
        if (!store.getSearchValue) {
          store.loadAllTreeData(dataSet.toData(), formatMessage);
        }
      },
      select: ({ record }) => {
        handleSelect({
          record, store, projectId, organizationId, projectName,
        });
      },
      unSelect: ({ record }) => {
        // 禁用取消选中
        // eslint-disable-next-line no-param-reassign
        record.isSelected = true;
      },
    },
    transport: {
      read: {
        url: urlMaps[type],
        method: 'get',
        transformResponse(response) {
          try {
            const data = JSON.parse(response);
            if (data && data.failed) {
              return data;
            }
            const expandsKeys = store.getExpandedKeys;
            store.getSearchValue && store.setSearchValue('');
            return formatMaps[type]({ value: data, expandsKeys, formatMessage });
          } catch (e) {
            return response;
          }
        },
      },
    },
  };
};
