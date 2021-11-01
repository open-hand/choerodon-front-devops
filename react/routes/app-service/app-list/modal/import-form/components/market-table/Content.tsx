/* eslint-disable no-param-reassign */
import React, {
  useCallback,
} from 'react';
import {
  Table, Select, Form, TextField, Icon, CheckBox, Spin, Button,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import {
  forEach, isEmpty,
} from 'lodash';
import {
  TableQueryBarType, Record, SelectionMode, ButtonColor,
} from '@/interface';
import { useMarketTableStore } from './stores';

import './index.less';

const { Column } = Table;

const MarketSourceTable = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    modal,
    selectedDs,
    tableDs,
    searchDs,
    checkData,
    setAppChildren,
    setVersionChildren,
    getChecked,
    getIndeterminate,
    getAppIndeterminate,
    handleMarketServiceCheck,
    handleAppExpand,
    handleVersionExpand,
  } = useMarketTableStore();

  modal.handleOk(async () => {
    const records: Array<Record> = [];
    tableDs.forEach((record: Record) => {
      if (record.isSelected || record.get('indeterminate')) {
        const childDs = record.get('childrenDataSet');
        if (childDs && childDs.length) {
          childDs.forEach((eachRecord: Record) => {
            if (eachRecord.isSelected || eachRecord.get('indeterminate')) {
              const marketDs = eachRecord.get('childrenDataSet');
              if (marketDs && !isEmpty(marketDs.selected)) {
                forEach(marketDs.selected, (childRecord: Record) => {
                  const selected = selectedDs.find((selectedRecord: Record) => selectedRecord.get('deployObjectId') === childRecord.get('deployObjectId'));
                  if (!selected) {
                    const newRecord = selectedDs.create({
                      id: childRecord.get('deployObjectId'),
                      name: childRecord.get('marketServiceName'),
                      sourceProject: record.get('sourceProject'),
                      deployObjectId: childRecord.get('deployObjectId'),
                      versionName: childRecord.get('marketServiceVersion'),
                      marketAppId: record.get('id'),
                      marketAppVersionId: eachRecord.get('id'),
                      sourceApp: `${record.get('name')}-${eachRecord.get('versionNumber')}`,
                    });
                    records.push(newRecord);
                  } else {
                    records.push(selected);
                  }
                });
              }
            }
          });
        }
      }
    }, []);
    selectedDs.removeAll();
    await selectedDs.push(...records);
    checkData();
  });

  const handleTableHeaderCheck = useCallback((checked: boolean) => {
    if (checked) {
      tableDs.selectAll();
    } else {
      tableDs.unSelectAll();
    }
  }, []);

  const handleVersionHeaderCheck = useCallback(({ checked, record }) => {
    if (checked) {
      tableDs.select(record);
    } else {
      tableDs.unSelect(record);
    }
  }, []);

  const handleVersionCheck = useCallback(async ({
    checked, childRecord, childDs, parentRecord,
  }) => {
    if (checked) {
      childDs.select(childRecord);
    } else {
      childDs.unSelect(childRecord);
    }
    parentRecord.isSelected = getChecked(parentRecord) && !getIndeterminate(parentRecord);
    parentRecord.set('indeterminate', getAppIndeterminate(parentRecord));
  }, []);

  const renderCheckBoxHeader = () => (
    <CheckBox
      checked={!isEmpty(tableDs.selected) && tableDs.selected.length === tableDs.length}
      indeterminate={tableDs.some((record: Record) => record.get('indeterminate'))
      || (!!tableDs.selected.length
      && tableDs.selected.length !== tableDs.length)}
      onChange={handleTableHeaderCheck}
    />
  );

  const renderCheckBox = useCallback(({ record }) => (
    <CheckBox
      checked={record.isSelected}
      indeterminate={!record.isSelected && record.get('indeterminate')}
      onChange={(checked: boolean) => handleVersionHeaderCheck({
        checked,
        record,
      })}
    />
  ), []);

  const renderExpandedRow = useCallback(({ dataSet, record }) => {
    const childrenDataSet = record.get('childrenDataSet');
    if (!childrenDataSet || childrenDataSet.status === 'loading') {
      return <Spin />;
    }
    return (
      <div className={`${prefixCls}-expand`}>
        <div className={`${prefixCls}-expand-header`}>
          <CheckBox
            checked={record.isSelected}
            indeterminate={!record.isSelected && record.get('indeterminate')}
            onChange={(checked: boolean) => handleVersionHeaderCheck({
              checked,
              record,
            })}
            style={{ width: 40 }}
          />
          <span style={{ width: '30%' }}>应用版本</span>
          <span style={{ width: '30%' }}>发布时间</span>
          <span style={{ width: '30%' }}>最近更新</span>
          <span style={{ width: 30 }} />
        </div>
        <div className={`${prefixCls}-expand-main`}>
          {record.get('childrenDataSet').map((eachRecord: Record) => (
            <div key={eachRecord.id} className={`${prefixCls}-expand-content`}>
              <span className={`${prefixCls}-expand-content-border`} />
              <div className={`${prefixCls}-expand-item`}>
                <div className={`${prefixCls}-expand-item-header`}>
                  <CheckBox
                    checked={eachRecord.isSelected}
                    indeterminate={!eachRecord.isSelected && eachRecord.get('indeterminate')}
                    onChange={(checked: boolean) => handleVersionCheck({
                      checked,
                      childRecord: eachRecord,
                      childDs: record.get('childrenDataSet'),
                      parentRecord: record,
                    })}
                    style={{ width: 40 }}
                  />
                  <span style={{ width: '30%' }}>{eachRecord.get('versionNumber')}</span>
                  <span style={{ width: '30%' }}>{eachRecord.get('releaseDate')}</span>
                  <span style={{ width: '30%' }}>{eachRecord.get('lastUpdateDate')}</span>
                  <span style={{ width: 30 }}>
                    <Button
                      icon={eachRecord.get('expand') ? 'expand_less' : 'navigate_next'}
                      onClick={() => handleVersionExpand(eachRecord)}
                    />
                  </span>
                </div>
                {eachRecord.get('expand') && (
                  <div className={`${prefixCls}-expand-market-service`}>
                    {!eachRecord.get('childrenDataSet') || eachRecord.get('childrenDataSet').status === 'loading'
                      ? <Spin />
                      : eachRecord.get('childrenDataSet').map((childRecord: Record) => (
                        <div
                          key={childRecord.id}
                          className={`${prefixCls}-expand-market-service-item ${childRecord.isSelected ? `${prefixCls}-expand-market-service-item-selected` : ''}`}
                        >
                          <div className={`${prefixCls}-expand-market-service-item-content`}>
                            <CheckBox
                              checked={childRecord.isSelected}
                              onChange={(checked: boolean) => handleMarketServiceCheck({
                                checked,
                                childRecord,
                                childDs: eachRecord.get('childrenDataSet'),
                                parentDs: record.get('childrenDataSet'),
                                parentRecord: eachRecord,
                                record,
                              })}
                            />
                            <div className={`${prefixCls}-expand-market-service-item-text`}>
                              <div>
                                市场服务名称：
                                <span className={`${prefixCls}-expand-market-service-item-span`}>
                                  {childRecord.get('marketServiceName')}
                                </span>
                              </div>
                              <div>
                                市场服务版本：
                                <span className={`${prefixCls}-expand-market-service-item-span`}>
                                  {childRecord.get('marketServiceVersion')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);

  return (
    <div>
      <div className={`${prefixCls}-tips`}>
        <span>此页面仅会显示出发布了源代码的市场服务。</span>
      </div>
      <Form dataSet={searchDs} columns={4}>
        <Select name="app" searchable />
        <Select name="market_app_version_id" />
        <TextField
          name="params"
          colSpan={2}
          prefix={<Icon type="search" className={`${prefixCls}-prefix-icon`} />}
          placeholder={formatMessage({ id: 'search.placeholder' })}
        />
      </Form>
      <Table
        dataSet={tableDs}
        queryBar={'none' as TableQueryBarType}
        expandedRowRenderer={renderExpandedRow}
        expandIconColumnIndex={1}
        // @ts-ignore
        expandIconAsCell={false}
        selectionMode={'node' as SelectionMode}
        onExpand={handleAppExpand}
      >
        <Column
          name="checked"
          renderer={renderCheckBox}
          // header={renderCheckBoxHeader}
          width={45}
        />
        <Column name="name" />
        <Column name="sourceProject" />
        <Column name="lastUpdateDate" width={170} />
      </Table>
    </div>
  );
});

export default MarketSourceTable;
