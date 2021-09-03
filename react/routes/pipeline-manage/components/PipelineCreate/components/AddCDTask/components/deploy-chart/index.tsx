import React from 'react';
import {
  DataSet, Form, TextField, Select,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import YamlEditor from '@/components/yamlEditor';
import { mapping } from '../../stores/deployChartDataSet';

import './index.less';

const cssPrefix = 'c7ncd-addCDTask-deployChart';

export default observer(({
  dataSet,
}: {
  dataSet: DataSet
}) => (
  <div className={cssPrefix}>
    <p className={`${cssPrefix}__title`}>
      应用信息
    </p>
    <Form
      columns={2}
      dataSet={dataSet}
      className={`${cssPrefix}__form`}
    >
      <TextField name={mapping().appName.name} />
      <TextField name={mapping().appCode.name} />
    </Form>
    <div className={`${cssPrefix}__divided`} />
    <div className={`${cssPrefix}__configContent`}>
      <p className={`${cssPrefix}__title`}>
        应用配置
      </p>
      <Form columns={2} dataSet={dataSet}>
        <Select name={mapping().deployConfig.name} />
      </Form>
    </div>
    <YamlEditor />
  </div>
));
