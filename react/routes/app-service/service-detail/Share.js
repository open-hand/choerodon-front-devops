/* eslint-disable react/jsx-no-bind */
import React, { useEffect } from 'react';
import {
  TabPage, Content, Permission, Breadcrumb, Action, useFormatMessage,
} from '@choerodon/master';
import {
  Table, Modal, TextField, Pagination, Button as ProButton,
} from 'choerodon-ui/pro';
import {
  Button, Icon, Tooltip, Spin, Alert,
} from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import { Loading } from '@choerodon/components';
import { FormattedMessage } from 'react-intl';
import NoData from '@/routes/app-service/service-detail/images/nodata.png';
import { useAppTopStore } from '../stores';
import { useServiceDetailStore } from './stores';
import HeaderButtons from './HeaderButtons';
import ShareRule from './modals/share-rule';
import ClickText from '../../../components/click-text';

const { Column } = Table;

const versionTypeStyleMaps = {
  master: {
    color: '#4D90FE',
    background: '#E6F7FF',
    border: '#91D5FF',
  },
  hotfix: {
    color: '#F76776',
    background: '#FFF1F0',
    border: '#FFA39E',
  },
  bugfix: {
    color: '#FAAD14',
    background: '#FFFBE6',
    border: '#FFE58F',
  },
  feature: {
    color: '#FD729C',
    background: '#FFF0F6',
    border: '#FFADD2',
  },
  release: {
    color: '#1FC2BB',
    background: '#E6FFFB',
    border: '#87E8DE',
  },
};

const modalKey = Modal.key();
const modalStyle = {
  width: 380,
};

const Share = withRouter(observer((props) => {
  const {
    intlPrefix,
    prefixCls,
  } = useAppTopStore();
  const {
    intl: { formatMessage },
    shareDs,
    params: { id },
    detailDs,
    AppState,
  } = useServiceDetailStore();

  const format = useFormatMessage('c7ncd.appService');

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    shareDs.query();
  }

  function renderProjectName({ value, record }) {
    if (value && record.get('projectId')) {
      return <span>{value}</span>;
    }
    return <FormattedMessage id={`${intlPrefix}.project.all`} />;
  }

  function renderNumber({ record }) {
    return (
      <ClickText
        value={`#${record.get('viewId')}`}
        onClick={() => openModal('edit')}
        clickAble
        permissionCode={['choerodon.code.project.develop.app-service.ps.share.update']}
      />
    );
  }

  function renderAction(record) {
    const actionData = [
      {
        service: ['choerodon.code.project.develop.app-service.ps.share.delete'],
        text: formatMessage({ id: 'delete' }),
        action: () => handleDelete(record),
      },
    ];

    return <Action data={actionData} />;
  }

  function openModal(type) {
    const record = shareDs.current;
    const isModify = type !== 'add';
    const shareId = isModify ? record.get('id') : null;
    Modal.open({
      key: modalKey,
      title: formatMessage({ id: `${intlPrefix}.share.rule.${type}` }),
      children: <ShareRule
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        appServiceId={id}
        shareId={shareId}
        refresh={refresh}
      />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: isModify ? 'c7ncd.appService.Save' : 'c7ncd.appService.Add' }),
    });
  }

  function handleDelete(selfRecord) {
    const record = selfRecord || shareDs.current;
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.rule.delete.title` }),
      children: formatMessage({ id: `${intlPrefix}.rule.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
    };
    shareDs.delete(record, modalProps);
  }

  function openDetail(appServiceIds) {
    const {
      history,
      location,
    } = props;
    history.push(`/rducm/code-lib-management/assign${location.search}&appServiceIds=${appServiceIds}`);
  }

  const renderShareButton = () => {
    const isStop = detailDs.current && !detailDs.current.get('active');
    return (
      <Permission
        service={['choerodon.code.project.develop.app-service.ps.share.add']}
      >
        <div style={{
          position: 'absolute',
          zIndex: 100,
          right: 0,
          top: '-32px',
        }}
        >
          <Tooltip
            title={isStop ? <FormattedMessage id={`${intlPrefix}.button.disabled`} /> : ''}
            placement="bottom"
          >
            <ProButton
              funcType="flat"
              icon="playlist_add"
              onClick={() => openModal('add')}
              disabled={isStop}
            >
              { format({ id: 'AddSharingRule' }) }
            </ProButton>
          </Tooltip>
        </div>
      </Permission>
    );
  };

  function renderButtons() {
    const isStop = detailDs.current && !detailDs.current.get('active');
    return [
      <Permission
        service={['choerodon.code.project.develop.app-service.ps.share.add']}
      >
        <Tooltip
          title={isStop ? <FormattedMessage id={`${intlPrefix}.button.disabled`} /> : ''}
          placement="bottom"
        >
          <Button
            icon="playlist_add"
            onClick={() => openModal('add')}
            disabled={isStop}
          >
            <FormattedMessage id={`${intlPrefix}.share.rule.add`} />
          </Button>
        </Tooltip>
      </Permission>,
      <Permission
        service={['choerodon.code.project.develop.app-service.ps.permission.update']}
      >
        <Button
          icon="authority"
          onClick={() => openDetail(props.match.params.id)}
        >
          权限管理
        </Button>
      </Permission>,
    ];
  }

  function handleTableFilter(record) {
    return record.status !== 'add';
  }

  // eslint-disable-next-line consistent-return
  function getTitle() {
    if (detailDs.current) {
      return detailDs.current.get('name');
    }
  }

  const handleChangeListPage = (page, pageSize) => {
    shareDs.pageSize = pageSize;
    shareDs.query(page);
  };

  function handleChangeSearch(value) {
    shareDs.setQueryParameter('params', value);
    shareDs.query();
  }

  function renderTheme4Share() {
    return (
      <Loading display={shareDs.status !== 'ready'} type="c7n">
        {renderShareButton()}
        <div className="c7ncd-theme4-version">
          <Alert
            className="share-alert"
            message={(
              <div>
                {format({ id: 'tipOne' })}
                <br />
                {format({ id: 'tipTwo' })}
              </div>
)}
            type="warning"
            showIcon
          />
          <TextField
            placeholder={format({ id: 'ShareSearch' })}
            style={{
              width: '100%',
            }}
            suffix={(
              <Icon type="search" />
            )}
            onEnterDown={(e) => handleChangeSearch(e.target.value)}
            onChange={handleChangeSearch}
          />
          {
            shareDs.records && shareDs.records.length > 0 ? (
              <>
                {
                  shareDs.records.map((share) => (
                    <div className="c7ncd-theme4-version-item">
                      <div className="c7ncd-theme4-version-item-line">
                        <div>
                          <p>
                            <span className="c7ncd-theme4-version-item-line-viewId">{`#${share.get('viewId')}`}</span>
                            <span className="c7ncd-theme4-version-item-line-around">
                              (
                              {format({ id: 'Scope' })}
                              :
                              {renderProjectName({ value: share.get('projectName'), record: share })}
                              )
                            </span>
                          </p>
                          <p style={{ marginTop: 6 }}>
                            {
                              share.get('versionType') ? (
                                <>
                                  <span
                                    className="c7ncd-theme4-version-item-line-versionText"
                                  >
                                    {format({ id: 'VersionType' })}
                                    :
                                  </span>
                                  <span
                                    className="c7ncd-theme4-version-item-line-versionType"
                                    style={{
                                      color: versionTypeStyleMaps[share.get('versionType')]?.color || '#5365EA',
                                      background: versionTypeStyleMaps[share.get('versionType')]?.background || '#F0F5FF',
                                      border: `1px solid ${versionTypeStyleMaps[share.get('versionType')]?.border || '#ADC6FF'}`,
                                    }}
                                  >
                                    {share.get('versionType')}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span
                                    className="c7ncd-theme4-version-item-line-versionText"
                                  >
                                    共享特定版本:
                                  </span>
                                  <span className="c7ncd-theme4-version-item-line-versionType">{share.get('version')}</span>
                                </>
                              )
                            }
                          </p>
                        </div>
                        {renderAction(share)}
                      </div>
                    </div>
                  ))
                }
                <Pagination
                  total={shareDs.totalCount}
                  pageSize={shareDs.pageSize}
                  page={shareDs.currentPage}
                  onChange={handleChangeListPage}
                  style={{
                    marginTop: '17px',
                    float: 'right',
                  }}
                />
              </>
            ) : [
              <img className="c7ncd-theme4-version-item-nodata" src={NoData} alt="" />,
              <p className="c7ncd-theme4-version-item-nodataText">暂无共享设置</p>,
            ]
          }
        </div>
      </Loading>
    );
  }

  return AppState.getCurrentTheme === 'theme4' ? renderTheme4Share() : (
    <TabPage
      service={['choerodon.code.project.develop.app-service.ps.share']}
    >
      <HeaderButtons>
        {renderButtons()}
        <Button
          icon="refresh"
          onClick={refresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </HeaderButtons>
      <Breadcrumb title={getTitle()} />
      <Content className={`${prefixCls}-detail-content`}>
        <Table dataSet={shareDs} filter={handleTableFilter} pristine>
          <Column name="viewId" renderer={renderNumber} align="left" sortable />
          <Column renderer={renderAction} width="0.7rem" />
          <Column name="versionType" />
          <Column name="version" sortable />
          <Column name="projectName" renderer={renderProjectName} />
        </Table>
      </Content>
    </TabPage>
  );
}));

export default Share;
