/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Table } from 'choerodon-ui/pro';
import StatusIcon from '../../../../../components/StatusIcon';
import StatusTags from '../../../../../components/status-tag';
import AppName from '../../../../../components/appName';
import PodStatus from './components/pod-status';
import { useResourceStore } from '../../../stores';
import { useIstListStore } from './stores';
import Modals from './modals';
import UploadIcon from './components/upload-icon';
import ResourceListTitle from '../../components/resource-list-title';

import './index.less';

const { Column } = Table;

const Content = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    resourceStore: { getSelectedMenu: { parentId } },
    AppState: { currentMenuType: { id } },
  } = useResourceStore();
  const {
    istListDs,
    intl: { formatMessage },
  } = useIstListStore();

  function renderAppName({ value, record }) {
    const appServiceType = record.get('chartSource');
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

  return (
    <div className={`${prefixCls}-instance-table`}>
      <Modals />
      <ResourceListTitle type="instances" />
      <Table
        dataSet={istListDs}
        border={false}
        queryBar="bar"
      >
        <Column name="name" />
        <Column name="code" />
        <Column name="commandVersion" />
        <Column name="appServiceName" renderer={renderAppName} sortable />
      </Table>
    </div>
  );
});

export default Content;
