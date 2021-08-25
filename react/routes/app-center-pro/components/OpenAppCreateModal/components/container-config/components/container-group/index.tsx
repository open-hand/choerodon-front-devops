import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { Record, DataSet } from '@/interface';
import { mapping } from '../../stores/conGroupDataSet';

import './index.less';

const Index = ({
  className,
  dataSource,
}: {
  className?: string;
  dataSource: DataSet,
}) => {
  useEffect(() => {
    if (dataSource?.records?.length && dataSource?.records?.length === 1) {
      dataSource.records[0].set((mapping.focus.name as string), true);
    }
  }, []);

  const renderDataSource = () => dataSource.records.map((record: Record) => (
    <div
      className={`c7ncd-appCenterPro-conGroup__item ${record.get('focus') && 'c7ncd-appCenterPro-conGroup__item--focus'}`}
    >
      <p>{record.get('name')}</p>
      <div>
        <Icon type="delete_forever-o" />
        <Icon className="c7ncd-appCenterPro-conGroup__item__down" type="expand_more" />
      </div>
    </div>
  ));
  return (
    <div
      className={`c7ncd-appCenterPro-conGroup ${className}`}
    >
      {renderDataSource()}
    </div>
  );
};

Index.defaultProps = {
  className: '',
};

export default Index;
