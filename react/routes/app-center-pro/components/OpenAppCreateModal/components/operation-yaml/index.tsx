import React, { useState, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import _ from 'lodash';
import { Alert, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import YamlEditor from '@/components/yamlEditor';

const { TabPane } = Tabs;

let originValue: any;

const Index = observer(({
  dataSet,
  preName,
  startName,
  postName,
  style,
}: {
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

  const [activeKey, setActiveKey] = useState('1');

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
        <TabPane tab="前置操作" key="1" />
        <TabPane tab="启动命令" key="2" />
        <TabPane tab="后置操作" key="3" />
      </Tabs>
      <YamlEditor
        readOnly={false}
        value={getValue('value')}
        originValue={getValue('origin')}
        onValueChange={(value: string) => {
            dataSet?.current?.set(getValue('valueChange'), value);
        }}
      />
    </div>
  );
});

export default Index;
