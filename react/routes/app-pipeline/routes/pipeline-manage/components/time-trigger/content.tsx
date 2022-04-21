import React, { useEffect, useState } from 'react';
import {
  TextField,
  Table,
  Tooltip,
  Modal,
} from 'choerodon-ui/pro';
import {
  Icon,
  Button,
  message,
  Tag,
} from 'choerodon-ui';
import {
  Action,
  ciPipelineSchedulesApi,
} from '@choerodon/master';
import { useDebounceEffect } from 'ahooks';
import {
  observer,
} from 'mobx-react-lite';
import {
  mapping,
} from './stores/timeTriggerDataSet';
import {
  handleModal,
} from './create-trigger';
import {
  useTimeTriggerStore,
} from './stores';

import './index.less';

const {
  Column,
} = Table;

const cssPrefix = 'c7ncd-timeTrigger';

const Index = observer(() => {
  const {
    TimeTriggerDataSet,
    projectId,
    appServiceId,
  } = useTimeTriggerStore();

  const [value, setValue] = useState('');

  useDebounceEffect(
    () => {
      const func = async () => {
        await TimeTriggerDataSet.query();
        if (value) {
          const data = TimeTriggerDataSet
            .filter((record: any) => record?.get(mapping.planName.name).includes(value));
          TimeTriggerDataSet.loadData(data?.map((i: any) => i?.toData()));
        }
      };
      func();
    },
    [value],
    {
      wait: 300,
    },
  );

  const refresh = () => {
    TimeTriggerDataSet?.query();
  };

  const handleAddTrigger = () => {
    handleModal(appServiceId, refresh);
  };

  const renderAction = ({ record }: any) => (
    <Action data={[{
      service: ['choerodon.code.project.develop.ci-pipeline.ps.editTimeTrigger'],
      text: '修改',
      action: () => {
        handleModal(appServiceId, refresh, record?.toData());
      },
    }, {
      service: ['choerodon.code.project.develop.ci-pipeline.ps.stopTimeTrigger'],
      text: record?.get('active') ? '停用' : '启用',
      action: async () => {
        try {
          if (record?.get('active')) {
            await ciPipelineSchedulesApi.disabledPlan({ id: record?.get('id') });
          } else {
            await ciPipelineSchedulesApi.enablePlan({ id: record?.get('id') });
          }
          message.success(record?.get('active') ? '停用成功' : '启用成功');
          refresh();
        } catch (e) {
          console.log(e);
        }
      },
    }, {
      service: ['choerodon.code.project.develop.ci-pipeline.ps.deleteTimeTrigger'],
      text: '删除',
      action: () => {
        Modal.open({
          title: '删除定时计划',
          key: Modal.key(),
          children: (
            <p>{`确认要删除定时计划"${record?.get(mapping.planName.name)}吗"`}</p>
          ),
          onOk: async () => {
            try {
              await ciPipelineSchedulesApi.deletePlan({ id: record?.get('id') });
              refresh();
            } catch (e) {
              console.log(e);
            }
          },
        });
      },
    }]}
    />
  );

  return (
    <div className={cssPrefix}>
      <div className={`${cssPrefix}-title`}>
        <TextField
          placeholder="请输入搜索条件"
          prefix={<Icon type="search" />}
          className={`${cssPrefix}-title-textField`}
          value={value}
          onChange={(v) => setValue(v)}
        />
        <Button
          funcType="flat"
          icon="playlist_add"
          onClick={handleAddTrigger}
        >
          添加定时触发任务
        </Button>
      </div>
      <Table
        queryBar={'none' as any}
        dataSet={TimeTriggerDataSet}
        className={`${cssPrefix}-table`}
      >
        <Column
          name={mapping.planName.name}
          renderer={({ value: v, record }: any) => ((
            <Tooltip title={v}>
              {v}
            </Tooltip>
          ))}
        />
        <Column
          width={55}
          renderer={renderAction}
        />
        <Column
          title="状态"
          renderer={({ record }) => (
            <Tag
              color={record?.get('active') ? 'green-inverse' : 'gray-inverse'}
            >
              { record?.get('active') ? '启用' : '停用' }
            </Tag>
          )}
        />
        <Column
          name={mapping.branch.name}
          // @ts-ignore
          title={(
            <Tooltip title="执行分支/标记">
              执行分支/标记
            </Tooltip>
          )}
        />
        <Column name={mapping.triggerWay.name} />
        <Column
          name={mapping.nextTime.name}
          renderer={({ value: v }) => (
            <Tooltip title={v}>
              {v}
            </Tooltip>
          )}
        />
        <Column name={mapping.updater.name} />
      </Table>
    </div>
  );
});

export default Index;
