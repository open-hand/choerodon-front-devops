import React, {
  useEffect, useMemo, useState, Fragment,
} from 'react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { Choerodon } from '@choerodon/boot';
import { Form, Select } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import debounce from 'lodash/debounce';
import { useUpgradeStore } from './stores';
import { handlePromptError } from '../../../../../../../utils';
import YamlEditor from '../../../../../../../components/yamlEditor';

export default injectIntl(observer(() => {
  const {
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    store,
    vo: {
      id,
      parentId,
      versionId,
      appServiceId,
    },
    intlPrefix,
    prefixCls,
    refresh,
    modal,
    upgradeDs,
    versionsDs,
    upgradeStore,
    valueDs,
  } = useUpgradeStore();

  const record = upgradeDs.current;

  const [searchValue, setSearchValue] = useState('');
  const [hasEditorError, setHasEditorError] = useState(false);

  modal.handleOk(async () => {
    if (hasEditorError) {
      return false;
    }
    try {
      if (await upgradeDs.submit() !== false) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  });

  useEffect(() => {
    async function loadData() {
      await loadInitVersion();
      if (versionsDs.totalCount && !versionId) {
        const { id: newVersionId } = (versionsDs.toData())[0] || {};
        record.set('appServiceVersionId', newVersionId);
      } else {
        valueDs.setQueryParameter('versionId', versionId);
        valueDs.query();
      }
    }
    loadData();
  }, []);

  function loadInitVersion() {
    versionId && versionsDs.setQueryParameter('app_service_version_id', versionId);
    return loadVersions();
  }

  async function loadVersions(page = 1) {
    const res = await versionsDs.query(page);
    const records = upgradeStore.getOldVersions;
    if (res && !res.failed) {
      if (!res.isFirstPage) {
        versionsDs.unshift(...records);
      }
      const item = versionsDs.find((r) => r.get('version') === 'more__versions');
      item && versionsDs.remove(item);
      upgradeStore.setOldVersions(versionsDs.records);
      if (res.hasNextPage) {
        const loadMoreRecord = versionsDs.create({
          version: 'more__versions',
        });
        versionsDs.push(loadMoreRecord);
      }
      return res;
    }
    return false;
  }

  function handleSearchVersion(e) {
    e.persist();
    setSearchValue(e.target.value);
    searchVersion(e.target.value);
  }

  const searchVersion = useMemo(() => debounce((value) => {
    versionsDs.setQueryParameter('version', value);
    if (value) {
      versionsDs.setQueryParameter('app_service_version_id', null);
      loadVersions();
    } else {
      loadInitVersion();
    }
  }, 500), []);

  function handleBlur() {
    setSearchValue('');
    if (searchValue && !versionsDs.totalCount) {
      searchVersion();
    }
  }

  function handleOptionRenderer({ text, value }) {
    if (text === 'more__versions') {
      return (
        <a
          className={`${prefixCls}-instance-upgrade-select-more`}
          onClick={handleLoadMoreVersion}
          role="none"
        >
          {formatMessage({ id: 'loadMore' })}
        </a>
      );
    }
    return text;
  }

  function handleLoadMoreVersion(e) {
    e.stopPropagation();
    loadVersions(versionsDs.currentPage + 1);
  }

  function handleRenderer({ text, value }) {
    if (upgradeDs.current && upgradeDs.current.get('appServiceVersionName')) {
      return upgradeDs.current.get('appServiceVersionName');
    }
    if (value === text) {
      return '';
    }
    return text;
  }

  function getValue() {
    const yaml = valueDs && valueDs.current ? valueDs.current.get('yaml') : '';
    const values = record ? record.get('values') : '';
    return (
      <YamlEditor
        readOnly={false}
        value={values || yaml || ''}
        originValue={yaml}
        handleEnableNext={handleNextStepEnable}
        onValueChange={handleChangeValue}
      />
    );
  }

  function handleNextStepEnable(flag) {
    setHasEditorError(flag);
    modal.update({ okProps: { disabled: flag } });
  }

  function handleChangeValue(value) {
    record.set('values', value);
  }

  return (
    <>
      <Form dataSet={upgradeDs}>
        <Select
          name="appServiceVersionId"
          searchable
          searchMatcher={() => true}
          onInput={handleSearchVersion}
          onBlur={handleBlur}
          renderer={handleRenderer}
          optionRenderer={handleOptionRenderer}
          clearButton={false}
          className={`${prefixCls}-instance-upgrade-select`}
          popupCls="c7ncd-select-menu-item-more-hidden"
        />
      </Form>
      <div className={`${prefixCls}-instance-upgrade-tips`}>
        <strong>注意：</strong>
        <span>
          <br />
          - 在变更实例时，Chart包内或者values中控制副本数量的配置将不会生效，而是会和现有生效的实例的副本数保持一致。
          <br />
          - 若想修改副本数量，请在部署后前往运行详情页面中更改Pod数量即可。
          <br />
          - 下方values中其他参数字段修改后依然会生效。
        </span>
      </div>
      <Spin spinning={valueDs.status === 'loading'}>
        {getValue()}
      </Spin>
    </>
  );
}));
