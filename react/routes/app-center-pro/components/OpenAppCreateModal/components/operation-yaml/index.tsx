import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  DataSet, Tooltip, Icon, Button,
} from 'choerodon-ui/pro';
import _ from 'lodash';
import { Alert, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import YamlEditor from '@/components/yamlEditor';
import {
  handleModal,
} from '@/components/host-guide';

import './index.less';

const { TabPane } = Tabs;

let originValue: any;

const Index = observer(({
//   configDataSet,
//   optsDS,
  dataSet,
  preName,
  startName,
  postName,
  deleteName,
  healthName,
  style,
  hasGuide,
}: {
    configDataSet?:DataSet,
    optsDS?:DataSet,
    dataSet: DataSet,
    preName: string,
    startName: string,
    postName: string,
    style?: object,
    deleteName?: string,
    healthName?: string,
    hasGuide?: boolean,
}) => {
  useEffect(() => {
    originValue = {
      [preName]: _.cloneDeep(dataSet.current?.get(preName)),
      [startName]: _.cloneDeep(dataSet.current?.get(startName)),
      [postName]: _.cloneDeep(dataSet.current?.get(postName)),
      ...deleteName ? {
        [deleteName]: _.cloneDeep(dataSet.current?.get(deleteName)),
      } : {},
      ...healthName ? {
        [healthName]: _.cloneDeep(dataSet.current?.get(healthName)),
      } : {},
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
      className="c7ncd-operationYaml"
    >
      <Alert
        type="warning"
        showIcon
        message={(
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0 }}>
              【前置命令】、【启动命令】、【后置命令】三者之中，必须至少填写一个
            </p>
            {
              hasGuide && (
                <Button
                  icon="view_list-o"
                  funcType={'flat' as any}
                  onClick={() => handleModal()}
                >
                  主机部署指引
                </Button>
              )
            }
          </div>
        )}
      />
      <Tabs onChange={(value) => setActiveKey(value)} activeKey={activeKey}>
        {/* <TabPane
          tab={(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              配置文件
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
        </TabPane> */}
        <TabPane tab="前置操作" key="1" />
        <TabPane tab="启动命令" key="2" />
        <TabPane tab="后置操作" key="3" />
      </Tabs>
      {/* {activeKey !== 'configurationCenter' && ( */}
      <YamlEditor
        readOnly={false}
        showError={false}
        value={getValue('value')}
        originValue={getValue('origin')}
        onValueChange={(value: string) => {
          dataSet?.current?.set(getValue('valueChange'), value);
        }}
      />
      {
        deleteName && activeKey === '2' && [
          <div className="c7ncd-operationYaml-others">
            <p className="c7ncd-operationYaml-title">删除操作</p>
            <YamlEditor
              showError={false}
              readOnly={false}
              originValue={originValue?.[deleteName]}
              value={dataSet?.current?.get(deleteName)}
              onValueChange={(value: string) => {
                dataSet?.current?.set(deleteName, value);
              }}
            />
          </div>,
        ]
       }
      {
        healthName && activeKey === '2' && [
          <div className="c7ncd-operationYaml-others">
            <p className="c7ncd-operationYaml-title">Readiness Probe</p>
            <YamlEditor
              showError={false}
              readOnly={false}
              originValue={originValue?.[healthName]}
              value={dataSet?.current?.get(healthName)}
              onValueChange={(value: string) => {
                dataSet?.current?.set(healthName, value);
              }}
            />
          </div>,
        ]
       }
    </div>
  );
});

export default Index;
