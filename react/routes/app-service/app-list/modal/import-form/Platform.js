import React, {
  useMemo,
} from 'react';
import {
  Table, Modal, Select, Button,
} from 'choerodon-ui/pro';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui';
import SourceTable from './SourceTable';
import MarketSourceTable from './components/market-table';
import GitlabSourceTable from './components/gitlab-table';
import Tips from '../../../../../components/new-tips';
import { useImportAppServiceStore } from './stores';

const { Column } = Table;

const modalKey1 = Modal.key();
const marketModalKey = Modal.key();
const gitlabModalKey = Modal.key();
const modalStyle1 = {
  width: 740,
};

const Platform = injectIntl(observer(({ checkData, disabled }) => {
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

  const renderVersion = ({ record }) => (
    <Select
      record={record}
      name="versionId"
      searchable
      searchMatcher="version"
      clearButton={false}
      className={`${prefixCls}-import-platform-table-select`}
    />
  );

  const renderAction = () => (
    <Tooltip title={formatMessage({ id: 'delete' })}>
      <Button shape="circle" icon="delete" funcType="flat" onClick={handleDelete} />
    </Tooltip>
  );

  const renderSelect = (record) => (
    <Select name="type" record={record} />
  );
  const currentPlatFormType = importRecord?.get('platformType');
  const platFormTypeOpts = {
    share: {
      ds: selectedDs,
      openModal,
    },
    gitlab: {
      ds: gitlabSelectedDs,
      openModal: openGitLabModal,
    },
    market: {
      ds: marketSelectedDs,
      openModal: openMarketModal,
    },
  };
  function handleDelete() {
    const { ds } = platFormTypeOpts[currentPlatFormType];
    ds.remove(ds.current, false);
    ds.length && checkData();
  }
  const handleClick = () => {
    (platFormTypeOpts[currentPlatFormType].openModal)();
  };

  return (
    <div className={`${prefixCls}-import-platform`}>
      <Button
        funcType="raised"
        icon="add"
        onClick={handleClick}
        className="platform-button"
        disabled={importRecord.get('platformType') === 'gitlab' && !disabled}
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
          {!importRecord?.get('isGitLabTemplate')
            && (
              <blockquote className="c7ncd-import-gitlab-activate-note">
                {formatMessage({ id: 'c7ncd.import.gitlab.activate.note' })}
              </blockquote>
            )}
          <Table
            dataSet={gitlabSelectedDs}
            queryBar="none"
          >
            <Column name="serverName" editor />
            <Column
              name="name"
              editor
            />
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
