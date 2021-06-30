import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router-dom';
import { Action } from '@choerodon/master';
import map from 'lodash/map';
import { CardPagination } from '@choerodon/components';
import { useAppCenterListStore } from '@/routes/app-center/app-list/stores';
import { Record } from '@/interface';
import AppTypeLogo from '@/routes/app-center/components/type-logo';

import './index.less';

const ContentList = () => {
  const {
    prefixCls, intlPrefix, formatMessage, listDs, mainStore, tabKeys: { MARKET_TAB },
  } = useAppCenterListStore();

  const history = useHistory();
  const { search, pathname } = useLocation();

  const newPrefixCls = useMemo(() => `${prefixCls}-list-content`, []);

  const handleLinkDetail = useCallback((record) => {
    history.push({
      pathname: `${pathname}/detail/${record.get('id')}/${record.get('source')}`,
      search,
    });
  }, [search]);

  const getInfoContent = useCallback((record: Record) => {
    const {
      serviceCode, source, gitlab, latestVersion, sourceProject,
    } = record?.toData() || {};
    const infoData = {
      code: source === MARKET_TAB ? null : serviceCode,
      source: source === MARKET_TAB ? '应用市场' : null,
      gitlab,
      sourceProject,
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

  const getActionData = useCallback(() => {
    const actionData = [{
      text: '部署',
      handle: () => {},
      service: [],
    }];
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
              {getActionData()}
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
