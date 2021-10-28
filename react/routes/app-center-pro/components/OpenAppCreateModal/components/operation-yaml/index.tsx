import React, { useState, useEffect } from 'react';
import { DataSet, Tooltip, Icon } from 'choerodon-ui/pro';
import _ from 'lodash';
import { Alert, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import YamlEditor from '@/components/yamlEditor';
import ConfigurationTab from '@/components/configuration-center/ConfigurationTab';

const { TabPane } = Tabs;

let originValue: any;

const Index = observer(({
  configDataSet,
  optsDS,
  dataSet,
  preName,
  startName,
  postName,
  style,
}: {
    configDataSet?:DataSet,
    optsDS?:DataSet,
    dataSet: DataSet,
    preName: string,
    startName: string,
    postName: string,
    style?: object,
}) => {
  useEffect(() => {
    originValue = {
      [preName]: _.cloneDeep(dataSet.current?.get(preName)),
      [startName]: _.cloneDeep(dataSet.current?.get(startName)),
      [postName]: _.cloneDeep(dataSet.current?.get(postName)),
    };
  }, []);

  const [activeKey, setActiveKey] = useState('2');

  const getValue = (type: 'value' | 'valueChange' | 'origin') => {
    switch (activeKey) {
      case '1': {
        if (type === 'value') {
          return dataSet?.current?.get(preName);
        }
        if (type === 'valueChange') {
          return preName;
        }
        if (type === 'origin') {
          return originValue?.[preName];
        }
        break;
      }
      case '2': {
        if (type === 'value') {
          return dataSet?.current?.get(startName);
        }
        if (type === 'valueChange') {
          return startName;
        }
        if (type === 'origin') {
          return originValue?.[startName];
        }
        break;
      }
      case '3': {
        if (type === 'value') {
          return dataSet?.current?.get(postName);
        }
        if (type === 'valueChange') {
          return postName;
        }
        if (type === 'origin') {
          return originValue?.[postName];
        }
        break;
      }
      default: {
        return '';
      }
    }
    return '';
  };

  return (
    <div
      style={style || {}}
    >
      <Alert
        type="warning"
        showIcon
        message="【前置命令】、【启动命令】、【后置命令】三者之中，必须至少填写一个"
      />
      <Tabs onChange={(value) => setActiveKey(value)} activeKey={activeKey}>
        <TabPane
          tab={(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              配置中心
              <Tooltip
                title="可在此添加配置中心中维护好的配置文件。发布后的配置文件可以及时更新到主机的挂载路径下，并执行配置文件中维护的命令。可以动态的管理配置文件使之生效。"
                placement="bottom"
                arrowPointAtCenter
              >
                <Icon type="help  c7ncd-select-tips-icon-mr" />
              </Tooltip>
            </div>
        )}
          key="configurationCenter"
        >
          <ConfigurationTab
          // @ts-ignore
            configurationCenterDataSet={configDataSet}
            configCompareOptsDS={optsDS}
          />
        </TabPane>
        <TabPane tab="前置操作" key="1" />
        <TabPane tab="启动命令" key="2" />
        <TabPane tab="后置操作" key="3" />
      </Tabs>
      {activeKey !== 'configurationCenter' && (
        <YamlEditor
          readOnly={false}
          value={getValue('value')}
          originValue={getValue('origin')}
          onValueChange={(value: string) => {
                        dataSet?.current?.set(getValue('valueChange'), value);
          }}
        />
      )}
    </div>
  );
});

export default Index;
