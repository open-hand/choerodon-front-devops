/* eslint-disable no-param-reassign */
import React, { useMemo, useState } from 'react';
import {
  Table, Pagination,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import includes from 'lodash/includes';
import forEach from 'lodash/forEach';
import { useGitlabTableStore } from './stores';
import {
  TableQueryBarType,
} from '@/interface';
import './index.less';

const { Column } = Table;

const GitlabSourceTable = observer(() => {
  const {
    modal,
    tableDs,
    selectedDs,
    prefixCls,
  } = useGitlabTableStore();
  const selectedId = useMemo(() => selectedDs.map((record) => record.get('name')), [selectedDs]);
  modal.handleOk(() => {
    forEach(tableDs.selected, (record: any) => {
      if (!includes(selectedId, record.get('name'))) {
        record.set('type', '普通服务');
        selectedDs.push(record);
      }
    });
  });

  const [total, setTotal] = useState(11);

  // function handleChange(page: number, pageSize: number) {
  //   setTotal(6);
  //   console.log('[pagination]', page, pageSize);
  // }

  return (
    <div className={`${prefixCls}-table-wrap`}>
      <Table
        dataSet={tableDs}
        pagination={false}
        queryBar={'bar' as TableQueryBarType}
      >
        <Column name="name" />
        <Column name="lastActivityAt" width={170} />
      </Table>
      <Pagination
        dataSet={tableDs}
        showSizeChanger={tableDs.current?.get('showSizeChanger')}
        showTotal={(num, range) => `显示${range[0]}-${range[1]}`}
      />
    </div>
  );
});

export default GitlabSourceTable;
