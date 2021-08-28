import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Button, TextField } from 'choerodon-ui/pro';
import { Record, DataSet, FuncType } from '@/interface';
import { mapping } from '../../stores/conGroupDataSet';

import './index.less';

const Index = observer(({
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

  const handleClickItem = (record: any) => {
    dataSource.records.forEach((item) => {
      if (item.id === record.id) {
        item.set('focus', true);
      } else {
        item.set('focus', false);
      }
    });
  };

  const renderDataSource = () => dataSource.records.map((record: Record) => (
    <div
      role="none"
      className={`c7ncd-appCenterPro-conGroup__item ${record.get('focus') && 'c7ncd-appCenterPro-conGroup__item--focus'}`}
      onClick={() => handleClickItem(record)}
    >
      {
        record.get('edit') ? (
          <TextField
            value={record.get('name')}
            onChange={(value) => record.set('name', value)}
            onBlur={() => {
              record.set('edit', false);
            }}
          />
        ) : (
          <p
            role="none"
            onClick={(e) => record.set('edit', true)}
          >
            {record.get('name')}
          </p>
        )
      }
      <div>
        {
          dataSource.records.length > 1 && (
            <Icon
              type="delete_forever-o"
              onClick={(e) => {
                e.stopPropagation();
                dataSource.delete([record], false);
                handleClickItem(dataSource.records[0]);
              }}
            />
          )
        }
      </div>
    </div>
  ));
  return (
    <div
      className={`c7ncd-appCenterPro-conGroup ${className}`}
    >
      {renderDataSource()}
      <div
        style={{
          padding: '13px 10px',
        }}
      >
        <Button
          funcType={'flat' as FuncType}
          icon="add"
          onClick={() => dataSource.create()}
        >
          添加容器
        </Button>
      </div>
    </div>
  );
});

Index.defaultProps = {
  className: '',
};

export default Index;
