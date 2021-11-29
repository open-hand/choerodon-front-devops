import React from 'react';
import {
  DataSet, Form, TextField, Select, Button, Modal,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { FuncType, ButtonColor, LabelLayoutType } from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import { mapping } from '../../stores/deployChartDataSet';
import { deployWayData } from '../../stores/addCDTaskDataSetMap';

import './index.less';

const cssPrefix = 'c7ncd-addCDTask-deployChart';

export default observer(({
  dataSet,
  optionRenderValueId,
  rendererValueId,
  handleChangeValueIdValues,
  deployWay,
}: {
  deployWay: string,
  dataSet: DataSet,
  optionRenderValueId(): React.ReactNode,
  rendererValueId(): React.ReactNode,
  handleChangeValueIdValues(data: {
    value: string,
    valueIdList: object[] | undefined,
    valueId: string,
  }): void,
}) => {
  const renderValueIdText = () => (
    <div
      style={{
        marginTop: 20,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          flex: 1,
          background: '#FEEFF1',
          borderRadius: '4px',
          border: '1px solid #FFCCC7',
          padding: '6px 12px',
        }}
      >
        <Icon style={{ color: 'rgb(244, 67, 54)' }} type="error" />
        <span
          style={{
            fontSize: '12px',
            fontFamily: 'PingFangSC-Regular, PingFang SC',
            fontWeight: 400,
            color: 'var(--text-color3)',
            lineHeight: '20px',
          }}
        >
          修改配置信息后，所选的部署配置中的配置信息也将随之改动。
        </span>
      </div>
      <Button
        funcType={'flat' as FuncType}
        color={'blue' as ButtonColor}
        icon="edit-o"
        style={{ marginLeft: 16 }}
        onClick={() => {
          handleChangeValueIdValues({
            value: dataSet?.current?.get(mapping().value.name),
            valueIdList: dataSet?.current?.getField(mapping().deployConfig.name)?.options?.toData(),
            valueId: dataSet?.current?.get(mapping().deployConfig.name),
          });
        }}
        disabled={!dataSet?.current?.get(mapping().deployConfig.name)}
      >
        修改配置信息
      </Button>
    </div>
  );
  return (
    <div className={cssPrefix}>
      <p className={`${cssPrefix}__title`}>
        应用信息
      </p>
      <Form
        columns={2}
        dataSet={dataSet}
        className={`${cssPrefix}__form`}
      >
        {
          deployWay === deployWayData[0].value ? (
            <TextField name={mapping().appName.name} />
          ) : (
            <Select name={mapping().appName.name} />
          )
        }
        <TextField name={mapping().appCode.name} />
      </Form>
      <div className={`${cssPrefix}__divided`} />
      <div className={`${cssPrefix}__configContent`}>
        <p className={`${cssPrefix}__title`}>
          应用配置
        </p>
        <Form
          style={{
            position: 'absolute',
            left: '50px',
            top: '-8px',
          }}
          columns={2}
          dataSet={dataSet}
        >
          <Select
            className={`${cssPrefix}__anotherField`}
            prefix="部署配置:"
            name={mapping().deployConfig.name}
            optionRenderer={optionRenderValueId}
            renderer={rendererValueId}
          />
        </Form>
      </div>
      {
        renderValueIdText()
      }
      <YamlEditor
        readOnly
        value={dataSet?.current?.get(mapping().value.name)}
        onValueChange={
          (value: string) => dataSet?.current?.set(mapping().value.name as string, value)
        }
      />
    </div>
  );
});
