/* eslint-disable react/jsx-no-bind */
import React, {
  useMemo, useImperativeHandle, useState, useEffect, useCallback,
} from 'react';
import {
  TabPage, Content, Breadcrumb, Permission, Action,
} from '@choerodon/boot';
import {
  Table, Tooltip, Button, CheckBox, TextField, Pagination,
} from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import filter from 'lodash/filter';
import { Icon, Spin } from 'choerodon-ui';
import AppServiceServices from '@/routes/app-service/services';
import { useAppTopStore } from '../stores';
import { useServiceDetailStore } from './stores';
import HeaderButtons from './HeaderButtons';
import TimePopover from '../../../components/timePopover/TimePopover';
import Tips from '../../../components/new-tips';
import NoData from './images/nodata.png';

import './index.less';

const { Column } = Table;

const Version = withRouter(observer((props) => {
  const { prefixCls, intlPrefix } = useAppTopStore();
  const {
    detailDs,
    versionDs,
    intl: { formatMessage },
    AppState,
  } = useServiceDetailStore();

  const [selectedVersionList, setSelectedVersionList] = useState([]);

  const [isProjectOwner, setIsProjectOwner] = useState(false);

  const selectedRecordLength = useMemo(
    () => selectedVersionList.length, [selectedVersionList],
  );

  useEffect(() => {
    // 左侧详情变更后 重置选中list
    if (selectedVersionList && selectedVersionList.length && selectedVersionList.length > 0) {
      setSelectedVersionList([]);
    }
  }, [detailDs.current]);

  useEffect(() => {
    // 初始化如果有records 设置默认选中为false 防止切换tab 造成数据错误
    if (versionDs && versionDs.records && versionDs.records.length > 0) {
      versionDs.records.forEach((i) => {
        if (i.get('checked')) {
          i.set('checked', false);
        }
      });
    }
    AppServiceServices
      .axiosGetCheckAdminPermission(AppState.currentMenuType.projectId).then((res) => {
        setIsProjectOwner(res);
      });
  }, []);

  function refresh() {
    versionDs.query();
  }

  function renderTime({ value }) {
    return <TimePopover content={value} />;
  }

  function getTitle() {
    if (detailDs.current) {
      return detailDs.current.get('name');
    }
    return '';
  }

  function openDetail(appServiceIds) {
    const {
      history,
      location,
    } = props;
    history.push(`/rducm/code-lib-management/assign${location.search}&appServiceIds=${appServiceIds}`);
    // Modal.open({
    //   key: modalKey1,
    //   title: <Tips
    //     helpText={formatMessage({ id: `${intlPrefix}.detail.allocation.tips` })}
    //     title={formatMessage({ id: `${intlPrefix}.permission.manage` })}
    //   />,
    //   children: <ServicePermission
    //     dataSet={permissionDs}
    //     baseDs={detailDs}
    //     store={appServiceStore}
    //     nonePermissionDs={nonePermissionDs}
    //     intlPrefix="c7ncd.deployment"
    //     prefixCls={prefixCls}
    //     formatMessage={formatMessage}
    //     projectId={id}
    //     refresh={refresh}
    //   />,
    //   drawer: true,
    //   style: modalStyle,
    //   okText: formatMessage({ id: 'save' }),
    // });
  }

  function handleDelete(list, item) {
    const selectedRecords = list || [item];
    const version = selectedRecords[0] ? selectedRecords[0].get('version') : '';
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.version.delete.title` }),
      children: selectedRecords && selectedRecords.length > 1
        ? formatMessage({ id: `${intlPrefix}.version.delete.des` }, { version, length: selectedRecords.length })
        : formatMessage({ id: `${intlPrefix}.version.delete.des.single` }, { version }),
      okText: formatMessage({ id: 'delete' }),
      onOk: () => {
        setSelectedVersionList([]);
        versionDs.records.forEach((i) => {
          i.set('checked', false);
        });
      },
    };
    versionDs.delete(selectedRecords, modalProps);
  }

  function renderCheckboxHeader() {
    const indeterminate = versionDs.some((record) => record.selectable && record.isSelected);
    const isSelectAll = !versionDs.some((record) => record.selectable && !record.isSelected);
    return (
      <CheckBox
        checked={isSelectAll && indeterminate}
        indeterminate={!isSelectAll && indeterminate}
        onChange={(value) => {
          versionDs.forEach((record) => {
            if (record.selectable) {
              // eslint-disable-next-line no-param-reassign
              record.isSelected = value;
            }
          });
        }}
      />
    );
  }

  function renderCheckbox({ record }) {
    return (
      <Tooltip
        title={!record.selectable ? formatMessage({ id: `${intlPrefix}.version.tips` }) : ''}
        placement="top"
      >
        <CheckBox
          checked={record.isSelected}
          disabled={!record.selectable}
          onChange={(value) => {
            // eslint-disable-next-line no-param-reassign
            record.isSelected = value;
          }}
        />
      </Tooltip>
    );
  }

  const renderVersionAction = (record) => ([{
    service: ['choerodon.code.project.develop.app-service.ps.version.delete'],
    text: formatMessage({ id: `${intlPrefix}.version.delete` }),
    action: () => handleDelete(null, record),
    disabled: !selectedRecordLength,
  }]);

  const handleChangeListPage = (page, pageSize) => {
    versionDs.pageSize = pageSize;
    versionDs.query(page);
  };

  function handleChangeSearch(value) {
    versionDs.setQueryParameter('params', value);
    versionDs.query();
  }

  const handleChangeSelectedVersionList = (v, record) => {
    record.set('checked', v);
    // 如果选中
    if (v) {
      setSelectedVersionList([
        ...selectedVersionList,
        record,
      ]);
    } else {
      setSelectedVersionList(selectedVersionList.filter((i) => i.get('id') !== record.get('id')));
    }
  };

  function renderVersionButton() {
    return (
      <Permission
        service={['choerodon.code.project.develop.app-service.ps.version.delete']}
      >
        <Tooltip title={selectedVersionList.length === 0 && '请在下方列表中选择服务版本'}>
          <Button
            disabled={selectedVersionList.length === 0}
            onClick={() => handleDelete(selectedVersionList)}
            style={{
              position: 'absolute',
              zIndex: 100,
              right: 0,
              top: '-32px',
            }}
            funcType="flat"
            icon="delete_sweep-o"
          >
            删除版本
          </Button>
        </Tooltip>
      </Permission>
    );
  }

  /**
   * 全选反选
   * @param isSelectAll
   * @param ds
   * @param selectedList
   */
  const handleSelect = (isSelectAll, ds, selectedList) => {
    let selfSelectedList = selectedList;
    const ids = selectedList.map((i) => i.get('id'));
    ds.records.forEach((i) => {
      // 如果是全选
      if (isSelectAll) {
        // 如果当前是未选中
        if (!i.get('checked')) {
          i.set('checked', true);
        }
        // 如果state中没有这条加上
        if (!ids.includes(i.get('id'))) {
          selfSelectedList.push(i);
        }
      } else {
        //  如果是反选
        if (i.get('checked')) {
          //  如果一开始是选中的
          selfSelectedList = selfSelectedList.filter((j) => j.get('id') !== i.get('id'));
        } else {
          //  如果一开始是未选中的
          selfSelectedList.push(i);
        }
        i.set('checked', !i.get('checked'));
      }
    });
    setSelectedVersionList(selfSelectedList);
  };

  const renderTheme4Version = useCallback(() => (
    <Spin spinning={versionDs.status !== 'ready'}>
      {renderVersionButton()}
      <div className="c7ncd-theme4-version">
        <TextField
          placeholder="搜索服务版本"
          style={{
            width: '100%',
          }}
          prefix={(
            <Icon type="search" />
          )}
          onEnterDown={(e) => handleChangeSearch(e.target.value)}
          onChange={handleChangeSearch}
        />
        {
          versionDs.records && versionDs.records.length > 0 ? (
            <>
              <div className="c7ncd-appService-version__buttons">
                <p role="none" onClick={() => handleSelect(true, versionDs, selectedVersionList)}>全选</p>
                <p role="none" onClick={() => handleSelect(false, versionDs, selectedVersionList)}>反选</p>
              </div>
              {
                versionDs.records.map((version) => (
                  <>
                    <div className="c7ncd-theme4-version-item">
                      <div className="c7ncd-theme4-version-item-side">
                        {
                          isProjectOwner && (
                            <CheckBox
                              style={{ marginRight: 5 }}
                              checked={version.get('checked')}
                              onChange={(value) => handleChangeSelectedVersionList(value, version)}
                            />
                          )
                        }
                        <Tooltip title={version.get('version')}>
                          <span className="c7ncd-theme4-version-item-version">{version.get('version')}</span>
                        </Tooltip>
                        <Action data={renderVersionAction(version)} />
                      </div>
                      <div style={{ justifyContent: 'flex-end' }} className="c7ncd-theme4-version-item-side">
                        <span className="c7ncd-theme4-version-item-text">创建于</span>
                        <TimePopover content={version.get('creationDate')} />
                      </div>
                    </div>
                    {
                      version?.get('unfold') && (
                        <div className="c7ncd-theme4-version-unfold">
                          <p className="c7ncd-theme4-version-unfold-list">关联制品清单</p>
                        </div>
                      )
                    }
                  </>
                ))
              }
              <Pagination
                total={versionDs.totalCount}
                pageSize={versionDs.pageSize}
                page={versionDs.currentPage}
                onChange={handleChangeListPage}
                style={{
                  marginTop: '17px',
                  float: 'right',
                }}
              />
            </>
          ) : [
            <img className="c7ncd-theme4-version-item-nodata" src={NoData} alt="" />,
            <p className="c7ncd-theme4-version-item-nodataText">暂无服务版本</p>,
          ]
        }
      </div>
    </Spin>
  ), [versionDs.records, selectedVersionList, isProjectOwner]);

  return AppState.getCurrentTheme === 'theme4' ? (
    <HeaderButtons theme4>
      {renderTheme4Version()}
    </HeaderButtons>
  ) : (
    <TabPage
      service={[]}
    >
      <HeaderButtons>
        <Permission
          service={['choerodon.code.project.develop.app-service.ps.permission.update']}
        >
          <Button
            icon="authority"
            onClick={() => openDetail(props.match.params.id)}
            className={`${prefixCls}-detail-content-version-btn`}
          >
            权限管理
          </Button>
        </Permission>
        <Permission
          service={['choerodon.code.project.develop.app-service.ps.version.delete']}
        >
          <Tooltip title={selectedRecordLength ? '' : formatMessage({ id: `${intlPrefix}.version.delete.disable` })}>
            <Button
              icon="delete"
              onClick={handleDelete}
              disabled={!selectedRecordLength}
            >
              {formatMessage({ id: `${intlPrefix}.version.delete` })}
            </Button>
          </Tooltip>
        </Permission>
        <Button
          icon="refresh"
          onClick={refresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </HeaderButtons>
      <Breadcrumb title={getTitle()} />
      <Content className={`${prefixCls}-detail-content`}>
        <Table dataSet={versionDs}>
          <Column header={renderCheckboxHeader} renderer={renderCheckbox} width={50} />
          <Column name="version" sortable />
          <Column name="creationDate" renderer={renderTime} sortable />
        </Table>
      </Content>
    </TabPage>
  );
}));

export default Version;
