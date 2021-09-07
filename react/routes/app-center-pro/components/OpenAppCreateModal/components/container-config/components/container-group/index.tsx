import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Button, TextField } from 'choerodon-ui/pro';
import { Record, DataSet, FuncType } from '@/interface';
import ContainerDetail from '../container-detail';
import { mapping } from '../../stores/conGroupDataSet';

import './index.less';

const Index = observer(({
  className,
  dataSource,
  isPipeline,
}: {
  className?: string;
  dataSource: DataSet,
  isPipeline?: Boolean,
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

  const renderDataSource = () => dataSource.records.map((record: Record) => [
    <div
      role="none"
      className={`c7ncd-appCenterPro-conGroup__item ${record.get('focus') && 'c7ncd-appCenterPro-conGroup__item--focus'}`}
      style={{
        justifyContent: isPipeline ? 'flex-start' : 'space-between',
      }}
      onClick={() => handleClickItem(record)}
    >
      {
        isPipeline && (
          <Icon
            className="c7ncd-appCenterPro-conGroup__item__openIcon"
            type="baseline-arrow_right"
            onClick={() => record.set(mapping.open.name as string, !record.get(mapping.open.name))}
          />
        )
      }
      {
        record.get('edit') ? (
          <TextField
            autoFocus
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
      <div className={isPipeline ? 'c7ncd-appCenterPro-conGroup__item__pipelineDelete' : ''}>
        {
          dataSource.records.length > 1 && (
            <Icon
              type={isPipeline ? 'remove_circle_outline' : 'delete_forever-o'}
              onClick={(e) => {
                e.stopPropagation();
                dataSource.delete([record], false);
                handleClickItem(dataSource.records[0]);
              }}
            />
          )
        }
      </div>
    </div>,
    isPipeline && record.get(mapping.open.name) && (
      <ContainerDetail
        dataSource={record}
      />
    ),
  ]);
  return (
    <div
      className={`c7ncd-appCenterPro-conGroup ${className}`}
      style={{
        width: isPipeline ? '100%' : '300px',
      }}
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
          onClick={() => dataSource.create({
            [mapping.name.name as string]: `container-${dataSource.records.length + 1}`,
            [mapping.edit.name as string]: true,
          })}
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
