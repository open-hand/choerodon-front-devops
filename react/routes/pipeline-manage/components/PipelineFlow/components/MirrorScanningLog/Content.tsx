import React from 'react';
import { StatusTag, TimePopover } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { TableMode, TableQueryBarType } from '@/interface';
import ClickText from '@/components/click-text';
import getDuration from '@/utils/getDuration';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { useMirrorScanStore } from './stores';
import './index.less';

const { Column } = Table;

const MirrorScanning = () => {
  const {
    prefixCls,
    detailDs,
    tableDs,
    statusMap,
    history,
  } = useMirrorScanStore();

  const detailRecord = detailDs.current;

  const renderExpandRow = ({ dataSet, record }:any) => {
    const text = record.get('description');
    return (
      <div className={`${prefixCls}-table-describe`}>
        <p>
          简介：
          {text}
        </p>
      </div>
    );
  };

  const renderStatus = ({ value, text }:any) => {
    const { code, name } = statusMap.get(text) || {};
    return <StatusTag colorCode={code} type="border" name={name} />;
  };

  function handleLink(vulnerabilityCode:string) {
    window.open(`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnerabilityCode}`);
  }

  const renderDetails = () => {
    const {
      startDate,
      spendTime,
      level,
      highCount,
      lowCount,
      mediumCount,
      unknownCount,
      criticalCount,
    } = detailRecord.toData();
    const { code, name } = statusMap.get(level) || {};
    return (
      <div className={`${prefixCls}-detail`}>
        <div className={`${prefixCls}-detail-row`}>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              漏洞严重度：
            </span>
            {code ? <StatusTag colorCode={code} type="border" name={name} /> : '-'}
          </div>

          <div className={`${prefixCls}-detail-content`}>
            <span>
              镜像扫描开始时间：
            </span>
            {startDate ? <TimePopover content={startDate} /> : '-'}
          </div>

          <div className={`${prefixCls}-detail-content`}>
            <span>
              镜像扫描耗时：
            </span>
            <span>
              {spendTime ? getDuration({ value: spendTime, unit: 'ms' }) : '-'}
            </span>
          </div>
        </div>
        <div className={`${prefixCls}-detail-row`}>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              危急漏洞：
            </span>
            <span>
              {criticalCount || '-'}
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              严重漏洞：
            </span>
            <span>
              {highCount || '-'}
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              中等漏洞：
            </span>
            <span>
              {mediumCount || '-'}
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              较低漏洞：
            </span>
            <span>
              {lowCount || '-'}
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              未知漏洞：
            </span>
            <span>
              {unknownCount || '-'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${prefixCls}`}>
      {detailRecord && renderDetails()}
      <div className={`${prefixCls}-table`}>
        <Table
          dataSet={tableDs}
          mode={'tree' as TableMode}
          queryBar={'none' as TableQueryBarType}
          expandedRowRenderer={renderExpandRow}
        >
          <Column
            name="vulnerabilityCode"
            renderer={({ text, record }:any) => (
              <ClickText
                clickAble
                onClick={() => handleLink(record.get('vulnerabilityCode'))}
                value={text}
                showToolTip
              />
            )}
            sortable
          />
          <Column name="severity" renderer={renderStatus} width={100} sortable />
          <Column name="pkgName" sortable />
          <Column name="installedVersion" sortable renderer={({ text }) => <Tooltip title={text}>{text}</Tooltip>} />
          <Column name="fixedVersion" sortable renderer={({ text }) => <Tooltip title={text}>{text}</Tooltip>} />
        </Table>
      </div>
    </div>
  );
};

export default observer(MirrorScanning);
