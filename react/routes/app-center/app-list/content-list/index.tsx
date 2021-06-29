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
    prefixCls, intlPrefix, formatMessage, listDs, mainStore,
  } = useAppCenterListStore();

  const history = useHistory();
  const { search, pathname } = useLocation();

  const newPrefixCls = useMemo(() => `${prefixCls}-list-content`, []);

  const handleLinkDetail = useCallback((record) => {
    history.push({
      pathname: `${pathname}/detail/${record.get('id')}/${record.get('type')}`,
      search,
    });
  }, [search]);

  const getInfoContent = useCallback((record: Record) => {
    const {
      code, source, gitlab, version, sourceProject,
    } = record?.toData() || {};
    const infoData = {
      code,
      source,
      gitlab,
      sourceProject,
      version,
    };
    return map(infoData, (value: string, key: string) => (value ? (
      <div className={`${newPrefixCls}-info-item`}>
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
        {listDs.map((record) => (
          <div className={`${newPrefixCls}-item`}>
            <div className={`${newPrefixCls}-header`}>
              <AppTypeLogo type={record.get('type') || 'project'} />
              <span
                className={`${newPrefixCls}-header-title`}
                onClick={() => handleLinkDetail(record)}
                role="none"
              >
                {record.get('name')}
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
