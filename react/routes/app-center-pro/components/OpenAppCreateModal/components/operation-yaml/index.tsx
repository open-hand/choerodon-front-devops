import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Alert, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import YamlEditor from '@/components/yamlEditor';

const { TabPane } = Tabs;

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
}) => (
  <div
    style={style || {}}
  >
    <Alert
      type="warning"
      showIcon
      message="【前置命令】、【启动命令】、【后置命令】三者之中，必须至少填写一个"
    />
    <Tabs defaultActiveKey="1">
      <TabPane tab="前置操作" key="1">
        <YamlEditor
          modeChange={false}
          readOnly={false}
          value={dataSet?.current?.get(preName)}
          onValueChange={(value: string) => {
            dataSet?.current?.set(preName, value);
          }}
        />
      </TabPane>
      <TabPane tab="启动命令" key="2">
        <YamlEditor
          modeChange={false}
          readOnly={false}
          value={dataSet?.current?.get(startName)}
          onValueChange={(value: string) => {
            dataSet?.current?.set(startName, value);
          }}
        />
      </TabPane>
      <TabPane tab="后置操作" key="3">
        <YamlEditor
          modeChange={false}
          readOnly={false}
          value={dataSet?.current?.get(postName)}
          onValueChange={(value: string) => {
            dataSet?.current?.set(postName, value);
          }}
        />
      </TabPane>
    </Tabs>
  </div>
));

export default Index;
