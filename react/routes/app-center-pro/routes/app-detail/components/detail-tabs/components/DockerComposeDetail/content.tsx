import React from 'react';
import { Table, Tooltip, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import {
  Action,
  devopsDockerComposeApi,
} from '@choerodon/master';
import { useStore } from './stores';
import { mapping } from './stores/docerkComposeTableDataSet';

import './index.less';

const cssPrefix = 'c7ncd-dockerComposeDetail';

const { Column } = Table;

const Index = () => {
  const {
    DockerComposeDetailDataSet,
    id,
  } = useStore();

  const getActionData = (status: any, record: any) => {
    const data = [{
      service: ['choerodon.code.project.deploy.app-deployment.application-center.stopContainer'],
      text: status === 'running' ? '停用' : '启用',
      action: async () => {
        try {
          if (status === 'running') {
            await devopsDockerComposeApi.stopContainer(id, record?.get('id'));
          }
        } catch (err) {
          console.log(err);
        }

        DockerComposeDetailDataSet.query();
      },
    }, {
      service: ['choerodon.code.project.deploy.app-deployment.application-center.deleteContainer'],
      text: '删除',
      action: () => {
        Modal.open({
          key: Modal.key(),
          title: '确定删除?',
          children: '确定删除当条容器实例?',
          onOk: async () => {
            try {
              await devopsDockerComposeApi.removeContainer(id, record?.get('id'));
            } catch (err) {
              console.log(err);
            }
            DockerComposeDetailDataSet.query();
          },
        });
      },
    }];

    if (status === 'running') {
      data.unshift({
        service: ['choerodon.code.project.deploy.app-deployment.application-center.restartContainer'],
        text: '重启',
        action: async () => {
          try {
            await devopsDockerComposeApi.restartContainer(id, record?.get('id'));
          } catch (err) {
            console.log(err);
          }
          DockerComposeDetailDataSet.query();
        },
      });
    }
    return data;
  };

  return (
    <div className={cssPrefix}>
      <p className={`${cssPrefix}-title`}>容器实例</p>
      <Table dataSet={DockerComposeDetailDataSet}>
        <Column name={mapping.containerName.name} />
        <Column
          width={55}
          renderer={({ record }) => (
            <Action
              data={getActionData(record?.get(mapping.status.name), record)}
            />
          )}
        />
        <Column
          name={mapping.image.name}
          renderer={({ value }) => (
            <Tooltip title={value}>
              {value}
            </Tooltip>
          )}
        />
        <Column
          name={mapping.port.name}
          renderer={({ value }) => (
            <Tooltip title={value}>
              {value}
            </Tooltip>
          )}
        />
        <Column
          name={mapping.status.name}
          renderer={({ value }) => (value ? <Tag color={value === 'running' ? 'green-inverse' : 'gray-inverse'}>{value}</Tag> : '')}
        />
      </Table>
    </div>
  );
};

export default Index;
