import React, {
  Fragment, useCallback, useState, useEffect, useMemo,
} from 'react';
import {
  Table, Modal, Select, Button,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Icon, Tooltip } from 'choerodon-ui';

import SourceTable from './SourceTable';
import MarketSourceTable from './components/market-table';
import GitlabSourceTable from './components/gitlab-table';
import Tips from '../../../../../components/new-tips';
import { useImportAppServiceStore } from './stores';

const { Column } = Table;
const { Option } = Select;

const modalKey1 = Modal.key();
const marketModalKey = Modal.key();
const gitlabModalKey = Modal.key();
const modalStyle1 = {
  width: 740,
};

const Platform = injectIntl(observer(({ checkData }) => {
  const {
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    intlPrefix,
    prefixCls,
    importDs,
    importTableDs,
    selectedDs,
    importStore,
    marketSelectedDs,
    gitlabSelectedDs,
  } = useImportAppServiceStore();
  const importRecord = useMemo(() => importDs.current || importDs.records[0], [importDs.current]);

  function openModal() {
    Modal.open({
      key: modalKey1,
      drawer: true,
      title: <Tips
        helpText={formatMessage({ id: `${intlPrefix}.add.tips` })}
        title={formatMessage({ id: `${intlPrefix}.add` })}
      />,
      children: <SourceTable
        tableDs={importTableDs}
        selectedDs={selectedDs}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        store={importStore}
        projectId={projectId}
        importRecord={importRecord}
      />,
      style: modalStyle1,
      okText: formatMessage({ id: 'add' }),
      afterClose: () => {
        importTableDs.removeAll();
        if (selectedDs.length) {
          checkData();
          selectedDs.forEach((record) => {
            record.getField('versionId').fetchLookup();
          });
        }
      },
    });
  }

  function openMarketModal() {
    Modal.open({
      key: marketModalKey,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.add` }),
      children: <MarketSourceTable selectedDs={marketSelectedDs} checkData={checkData} />,
      style: modalStyle1,
      okText: formatMessage({ id: 'add' }),
    });
  }

  function openGitLabModal() {
    Modal.open({
      key: gitlabModalKey,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.add` }),
      children: <GitlabSourceTable selectedDs={gitlabSelectedDs} importRecord={importRecord} />,
      okText: formatMessage({ id: 'add' }),
      afterClose: () => {
        importTableDs.removeAll();
        if (gitlabSelectedDs.length) {
          checkData();
        }
      },
    });
  }

  function renderVersion({ record }) {
    return (
      <Select
        record={record}
        name="versionId"
        searchable
        searchMatcher="version"
        clearButton={false}
        className={`${prefixCls}-import-platform-table-select`}
      />
    );
  }

  function renderAction() {
    return (
      <Tooltip title={formatMessage({ id: 'delete' })}>
        <Button shape="circle" icon="delete" funcType="flat" onClick={handleDelete} />
      </Tooltip>
    );
  }

  function renderSelect(record) {
    return (
      <Select name="type" record={record}>
        <Option value="普通服务">普通服务</Option>
        <Option value="测试服务">测试服务</Option>
      </Select>
    );
  }

  function handleDelete() {
    let ds;
    if (importRecord?.get('platformType') === 'market') {
      ds = marketSelectedDs;
    }
    if (importRecord?.get('platformType') === 'share') {
      ds = selectedDs;
    }
    if (importRecord?.get('platformType') === 'gitlab') {
      ds = gitlabSelectedDs;
    }
    ds.remove(ds.current, false);
    ds.length && checkData();
  }
  function handleClick() {
    if (importRecord?.get('platformType') === 'share') {
      openModal();
    }
    if (importRecord?.get('platformType') === 'market') {
      openMarketModal();
    }
    if (importRecord?.get('platformType') === 'gitlab') {
      openGitLabModal();
    }
  }

  return (
    <div className={`${prefixCls}-import-platform`}>
      <Button
        funcType="raised"
        icon="add"
        onClick={handleClick}
        className="platform-button"
      >
        <FormattedMessage id={`${intlPrefix}.add`} />
      </Button>
      {importRecord?.get('platformType') === 'share' && (
        <Table
          dataSet={selectedDs}
          queryBar="none"
        >
          <Column name="name" editor />
          <Column name="code" editor />
          <Column name="versionId" renderer={renderVersion} align="left" />
          <Column name="projectName" width="1.5rem" header={formatMessage({ id: `${intlPrefix}.belong.${importRecord.get('platformType')}` })} />
          <Column renderer={renderAction} width="0.7rem" />
        </Table>
      )}
      {importRecord?.get('platformType') === 'market' && (
        <Table
          dataSet={marketSelectedDs}
          queryBar="none"
        >
          <Column name="name" editor />
          <Column name="code" editor />
          <Column name="versionName" tooltip="overflow" />
          <Column name="sourceApp" tooltip="overflow" />
          <Column name="sourceProject" tooltip="overflow" />
          <Column renderer={renderAction} width="0.7rem" />
        </Table>
      )}
      {importRecord?.get('platformType') === 'gitlab' && (
      <>
        <Table
          dataSet={gitlabSelectedDs}
          queryBar="none"
        >
          <Column name="serverName" editor />
          <Column name="name" />
          <Column
            name="type"
            editor={renderSelect}
          />
          <Column name="lastActivityAt" editor />
          <Column renderer={renderAction} width="0.7rem" />
        </Table>
      </>
      )}
    </div>
  );
}));

export default Platform;
