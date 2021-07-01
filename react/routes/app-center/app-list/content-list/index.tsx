import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router-dom';
import { Action } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import map from 'lodash/map';
import { CardPagination } from '@choerodon/components';
import { useAppCenterListStore } from '@/routes/app-center/app-list/stores';
import { Record } from '@/interface';
import AppTypeLogo from '@/routes/app-center/components/type-logo';
import DeleteRelated from '@/routes/app-center/app-list/components/delete-related';

import './index.less';

const deleteRelatedKey = Modal.key();

const ContentList = ({
  openDeploy,
}: { openDeploy(data?: { appServiceSource: string, appServiceId: string }): void }) => {
  const {
    prefixCls, intlPrefix, formatMessage,
    listDs, tabKeys: { MARKET_TAB, PROJECT_TAB, SHARE_TAB },
  } = useAppCenterListStore();

  const history = useHistory();
  const { search, pathname } = useLocation();

  const newPrefixCls = useMemo(() => `${prefixCls}-list-content`, []);

  const refresh = useCallback(() => {
    listDs.query();
  }, []);

  const handleLinkDetail = useCallback((record) => {
    history.push({
      pathname: `${pathname}/detail/${record.get('id')}/${record.get('source')}`,
      search,
    });
  }, [search]);

  const deleteRelated = useCallback((record: Record) => {
    Modal.open({
      movable: false,
      closable: false,
      key: deleteRelatedKey,
      title: formatMessage({ id: `${intlPrefix}.delete.related` }),
      children: <DeleteRelated
        appServiceId={record.get('id')}
        refresh={refresh}
      />,
    });
  }, []);

  const getInfoContent = useCallback((record: Record) => {
    const {
      serviceCode, source, repoUrl, latestVersion, shareProjectName,
    } = record?.toData() || {};
    const infoData = {
      code: source === MARKET_TAB ? null : serviceCode,
      source: source === MARKET_TAB ? '应用市场' : null,
      gitlab: source === PROJECT_TAB && repoUrl
        ? `${repoUrl.split('//')[0]}//.../${repoUrl.split('/')[repoUrl.split('/')?.length - 1]}` : null,
      sourceProject: shareProjectName,
      version: latestVersion,
    };
    return map(infoData, (value: string, key: string) => (value ? (
      <div className={`${newPrefixCls}-info-item`} key={key}>
        <span className={`${newPrefixCls}-info-label`}>
          {formatMessage({ id: `${intlPrefix}.label.${key}` })}
          ：
        </span>
        <span>{value}</span>
      </div>
    ) : null));
  }, []);

  const getActionData = useCallback((record: Record) => {
    const appServiceSource = {
      [PROJECT_TAB]: 'normal_service',
      [SHARE_TAB]: 'share_service',
      [MARKET_TAB]: 'market_service',
    };
    const actionData = [{
      text: formatMessage({ id: `${intlPrefix}.delete.related` }),
      action: () => deleteRelated(record),
      service: [],
    }];
    if (record.get('latestVersion')) {
      actionData.unshift({
        text: formatMessage({ id: 'deployment' }),
        action: () => openDeploy({
          // @ts-ignore
          appServiceSource: appServiceSource[record.get('source')] || 'normal_service',
          appServiceId: `${record.get('id')}**${record.get('serviceCode')}`,
        }),
        service: [],
      });
    }
    return <Action className={`${newPrefixCls}-header-action`} data={actionData} />;
  }, []);

  return (
    <>
      <div className={newPrefixCls}>
        {listDs.map((record: Record) => (
          <div className={`${newPrefixCls}-item`} key={record.id}>
            <div className={`${newPrefixCls}-header`}>
              <AppTypeLogo type={record.get('source') || 'project'} />
              <span
                className={`${newPrefixCls}-header-title`}
                onClick={() => handleLinkDetail(record)}
                role="none"
              >
                {record.get('serviceName')}
              </span>
              {getActionData(record)}
            </div>
            <div className={`${newPrefixCls}-info`}>
              {getInfoContent(record)}
            </div>
          </div>
        ))}
      </div>
      <CardPagination
        className={`${prefixCls}-list-pagination`}
        dataSet={listDs}
      />
    </>
  );
};

export default observer(ContentList);
