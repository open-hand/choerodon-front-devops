import React, { useMemo } from 'react';
import map from 'lodash/map';
import { Progress, Tabs, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Size, TableQueryBarType } from '@/interface';
import { useHostConfigStore } from '@/routes/host-config/stores';

import './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

const ResourceContent = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    prefixCls,
    mainStore,
    mirrorTableDs,
    jarTableDs,
  } = useHostConfigStore();

  const usageData = useMemo(() => ({
    cpu: {
      title: formatMessage({ id: `${intlPrefix}.usage.cpu` }),
      field: 'cpu',
      value: 23,
    },
    root: {
      title: formatMessage({ id: `${intlPrefix}.usage.root` }),
      field: 'root',
      value: 12,
    },
    ram: {
      title: formatMessage({ id: `${intlPrefix}.usage.ram` }),
      field: 'root',
      value: 75,
    },
    data: {
      title: formatMessage({ id: `${intlPrefix}.usage.data` }),
      field: 'root',
      value: 50,
    },
  }), []);

  return (
    <div className={`${prefixCls}-resource`}>
      <span className={`${prefixCls}-resource-title`}>
        {mainStore.getSelectedHost?.name}
      </span>
      <div className={`${prefixCls}-resource-usage`}>
        {map(usageData, ({ title, value }) => (
          <div className={`${prefixCls}-resource-usage-item`}>
            <span className={`${prefixCls}-resource-usage-label`}>
              {title}
              ：
            </span>
            <Progress value={value} size={'small' as Size} />
          </div>
        ))}
      </div>
      <div className={`${prefixCls}-resource-tab`}>
        <Tabs defaultActiveKey="mirroring">
          <TabPane tab="镜像" key="mirroring">
            <Table
              dataSet={mirrorTableDs}
              queryBar={'none' as TableQueryBarType}
              className="c7ncd-tab-table"
            >
              <Column name="name" />
              <Column name="status" />
              <Column name="port" />
              <Column name="deployer" />
              <Column name="deployDate" />
            </Table>
          </TabPane>
          <TabPane tab="jar包" key="jar">
            <Table
              dataSet={jarTableDs}
              queryBar={'none' as TableQueryBarType}
              className="c7ncd-tab-table"
            >
              <Column name="name" />
              <Column name="process" />
              <Column name="port" />
              <Column name="deployer" />
              <Column name="deployDate" />
            </Table>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
});

export default ResourceContent;
