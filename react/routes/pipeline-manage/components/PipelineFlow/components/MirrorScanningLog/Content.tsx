import React from 'react';
import { StatusTag, TimePopover } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { TableQueryBarType } from '@/interface';
import getDuration from '@/utils/getDuration';
import { Table } from 'choerodon-ui/pro';
import { useMirrorScanStore } from './stores';
import './index.less';

const { Column } = Table;

const MirrorScanning = () => {
  const {
    prefixCls,
    detailDs,
  } = useMirrorScanStore();

  const renderExpandRow = ({ dataSet, record }:any) => {
    const text = record.get('describe');
    return (
      <div className={`${prefixCls}-table-describe`}>
        <p>
          简介：
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className={`${prefixCls}`}>
      <div className={`${prefixCls}-detail`}>
        <div className={`${prefixCls}-detail-row`}>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              漏洞严重度：
            </span>
            <StatusTag colorCode="error" type="border" name="严重" />
          </div>

          <div className={`${prefixCls}-detail-content`}>
            <span>
              镜像扫描开始时间：
            </span>
            <TimePopover content="2020.01.01 12:23:23" />
          </div>

          <div className={`${prefixCls}-detail-content`}>
            <span>
              镜像扫描耗时：
            </span>
            <span>
              {getDuration({ value: 5000 })}
            </span>
          </div>
        </div>
        <div className={`${prefixCls}-detail-row`}>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              危急漏洞：
            </span>
            <span>
              0
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              严重漏洞：
            </span>
            <span>
              12
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              较低漏洞：
            </span>
            <span>
              0
            </span>
          </div>
          <div className={`${prefixCls}-detail-content`}>
            <span>
              未知漏洞：
            </span>
            <span>
              0
            </span>
          </div>
        </div>
      </div>
      <div className={`${prefixCls}-table`}>
        <Table
          dataSet={detailDs}
          queryBar={'none' as TableQueryBarType}
          expandedRowRenderer={renderExpandRow}
        >
          <Column name="code" />
          <Column name="status" />
          <Column name="component" />
          <Column name="version" />
          <Column name="versionFix" />
        </Table>
      </div>
    </div>
  );
};

export default observer(MirrorScanning);
