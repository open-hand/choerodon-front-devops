/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip, Icon } from 'choerodon-ui';

import { Table } from 'choerodon-ui/pro';
import { StatusTag } from '@choerodon/components';
import AppName from '../../../../../components/appName';

import { useResourceStore } from '../../../stores';
import { useIstListStore } from './stores';
import Modals from './modals';
import ResourceListTitle from '../../components/resource-list-title';

import './index.less';

const { Column } = Table;

const Content = observer(() => {
  const {
    prefixCls,
    resourceStore: { getSelectedMenu: { parentId } },
    AppState: { currentMenuType: { id } },
  } = useResourceStore();
  const {
    istListDs,
    intl: { formatMessage },
  } = useIstListStore();

  function renderAppName({ value, record }) {
    const appServiceType = record.get('chartSource');
    if (!record.get('commandVersion') && record.get('error')) {
      return null;
    }
    return (
      <AppName
        width={0.18}
        name={value}
        showIcon={!!record.get('projectId')}
        self={appServiceType}
        isInstance
      />
    );
  }

  const renderName = ({ value, record }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
    }}
    >
      <span>{value}</span>
      {
        record.get('error') && (
        <Tooltip title={record.get('error')}>
          <Icon
            style={{
              color: '#f76776',
              marginLeft: '4px',
            }}
            type="info"
          />
        </Tooltip>
        )
      }
    </div>
  );

  const renderCommandVersion = ({ value, record }) => {
    if (!value && record.get('error')) {
      return <StatusTag colorCode="error" name="部署失败" />;
    }
    return value;
  };

  return (
    <div className={`${prefixCls}-instance-table`}>
      <Modals />
      <ResourceListTitle type="instances" />
      <Table
        dataSet={istListDs}
        border={false}
        queryBar="bar"
      >
        <Column name="name" renderer={renderName} />
        <Column name="code" />
        <Column name="commandVersion" renderer={renderCommandVersion} />
        <Column name="appServiceName" renderer={renderAppName} sortable />
      </Table>
    </div>
  );
});

export default Content;
