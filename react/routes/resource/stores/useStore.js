import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/master';
import {
  map, isEmpty, forEach, omit, pick, concat,
} from 'lodash';
import {
  viewTypeMappings, RES_TYPES, ENV_KEYS,
} from './mappings';

const { RES_VIEW_TYPE } = viewTypeMappings;

export default function useStore(viewType) {
  return useLocalStore(() => ({
    showHeader: true,
    setShowHeader(flag) {
      this.showHeader = flag;
    },
    get getShowHeader() {
      return this.showHeader;
    },

    selectedMenu: {},
    viewType: viewType || RES_VIEW_TYPE,
    setSelectedMenu(data) {
      this.selectedMenu = data;
    },
    get getSelectedMenu() {
      return this.selectedMenu;
    },
    changeViewType(data) {
      this.viewType = data;
    },
    get getViewType() {
      return this.viewType;
    },

    expandedKeys: [],
    searchValue: '',
    setExpandedKeys(keys) {
      this.expandedKeys = keys;
    },
    get getExpandedKeys() {
      return this.expandedKeys.slice();
    },
    setSearchValue(value) {
      this.searchValue = value;
    },
    get getSearchValue() {
      return this.searchValue;
    },
    upTarget: {},
    /**
     * 设置需要更新的模块信息
     * @param data { type, id }
     */
    setUpTarget(data) {
      this.upTarget = data;
    },
    get getUpTarget() {
      return this.upTarget;
    },

    /**
     * 树结构已展开的节点的key
     */
    loadedKeys: [],
    setLoadedKeys(keys) {
      this.loadedKeys = keys;
    },
    get getLoadedKeys() {
      return this.loadedKeys.slice();
    },

    childrenDataMap: new Map(),
    get getChildrenDataMap() {
      return this.childrenDataMap;
    },
    parentDataMap: new Map(),
    get getParentDataMap() {
      return this.parentDataMap;
    },

    allTreeData: [],
    get getAllTreeData() {
      return this.allTreeData;
    },
    setAllTreeData(data) {
      this.allTreeData = data;
    },

    async checkExist({
      projectId, envId, type, id,
    }) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/envs/${envId}/check?type=${type}&object_id=${id}`);
        if (typeof res === 'boolean') {
          return res;
        }
        // 只有请求到false，才返回false
        return true;
      } catch (e) {
        return true;
      }
    },

    handleSelectedMenuData({ treeDs, item }) {
      const itemRecord = treeDs.create(item);
      const { key: selectedKey } = this.selectedMenu;
      if (selectedKey && selectedKey === item.key) {
        itemRecord.isSelected = true;
        this.setSelectedMenu(item);
      }
      return itemRecord;
    },

    loadMoreRecordData({ key, treeDs, children }) {
      try {
        this.setLoadedKeys([...this.loadedKeys, key]);
        if (children) {
          return;
        }
        const recordData = this.childrenDataMap.get(key);
        if (recordData) {
          const records = map(recordData, (item) => {
            const itemRecord = this.handleSelectedMenuData({ treeDs, item });
            return itemRecord;
          });
          treeDs.push(...records);
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },

    loadAllTreeData(allData, formatMessage) {
      const flatted = [];
      const expandsKeys = this.expandedKeys;
      this.childrenDataMap.clear();
      this.parentDataMap.clear();
      const flatResourceData = (data) => {
        forEach(data, (node) => {
          const envInfo = pick(node, ENV_KEYS);
          const envId = envInfo.id;
          const envKey = String(envId);
          const { childrenData } = node;
          const groups = [];
          forEach(RES_TYPES, (type, index) => {
            const child = childrenData[type];
            const groupKey = `${envId}**${type}`;
            const group = {
              id: index,
              name: formatMessage({ id: `${type}` }),
              key: groupKey,
              isGroup: true,
              itemType: `group_${type}`,
              parentId: envKey,
              expand: expandsKeys.includes(groupKey),
              isLeaf: isEmpty(child),
            };

            const items = [];
            forEach(child, (item) => {
              const newItemKey = `${envId}**${item.id}**${type}`;
              const newItem = ({
                ...item,
                name: item.name,
                key: newItemKey,
                itemType: type,
                parentId: groupKey,
                expand: false,
                isLeaf: true,
              });
              items.push(newItem);
              this.parentDataMap.set(newItemKey, group);
            });
            groups.push(group);
            flatted.push(group, ...items);
            this.parentDataMap.set(groupKey, node);
            if (!isEmpty(child)) {
              this.childrenDataMap.set(groupKey, items);
            }
          });
          this.childrenDataMap.set(envKey, groups);
        });
      };
      flatResourceData(allData);
      const realData = concat(allData, flatted);
      this.setAllTreeData(realData);
      this.setLoadedKeys([]);
    },
  }));
}
