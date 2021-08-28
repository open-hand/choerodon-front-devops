import React, { useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, NumberField, TextField, Icon, Button,
} from 'choerodon-ui/pro';
import { useDeployGroupConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config/stores';
import { mapping } from './stores/deployGroupConfigDataSet';
import CollapseContainer from './components/collapse-container';
import { Record, FuncType, DataSet } from '@/interface';

import './index.less';
import StatusDot from '@/components/status-dot';

const Index = observer(() => {
  const {
    cRef,
    DeployGroupConfigDataSet,
    OptionDataSet,
    AnnotationsDataSet,
    LabelsDataSet,
    NodeLabelsDataSet,
    HostAliasesDataSet,
  } = useDeployGroupConfigStore();

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const dsList = [
        DeployGroupConfigDataSet.validate(),
        OptionDataSet.validate(),
        AnnotationsDataSet.validate(),
        LabelsDataSet.validate(),
        NodeLabelsDataSet.validate(),
        HostAliasesDataSet.validate(),
      ];
      let flag = false;
      for await (const ds of dsList) {
        const res = await ds;
        if (!res) {
          flag = true;
        }
      }
      if (flag) {
        return false;
      }
      return ({
        appConfig: DeployGroupConfigDataSet.current.toData(),
        options: OptionDataSet.toData(),
        annotations: AnnotationsDataSet.toData(),
        labels: LabelsDataSet.toData(),
        nodeLabels: NodeLabelsDataSet.toData(),
        hostAliases: HostAliasesDataSet.toData(),
      });
    },
    handleInit: (data: any) => {
      DeployGroupConfigDataSet.loadData([data.appConfig]);
      OptionDataSet.loadData(data.options);
      AnnotationsDataSet.loadData(data.annotations);
      LabelsDataSet.loadData(data.labels);
      NodeLabelsDataSet.loadData(data.nodeLabels);
      HostAliasesDataSet.loadData(data.hostAliases);
    },
  }));

  const getKeyValueRenderByDs = (ds: DataSet, label: string) => (
    <Form className="c7ncd-appCenterPro-deployGroup__options" columns={2}>
      {
        ds.records.map((optionRecord: Record) => (
          <Form
            // @ts-ignore
            colspan={1}
            record={optionRecord}
          >
            <div className="c7ncd-appCenterPro-deployGroup__options__item">
              <div>
                <TextField name="key" />
              </div>
              <span className="c7ncd-appCenterPro-deployGroup__options__item__equal">=</span>
              <div>
                <TextField name="value" />
              </div>
              {
                ds.records.length > 1 && (
                  <Icon
                    className="c7ncd-appCenterPro-deployGroup__options__item__delete"
                    type="delete"
                    onClick={() => ds.delete([optionRecord], false)}
                  />
                )
              }
            </div>
          </Form>
        ))
      }
      <Button
        // @ts-ignore
        colSpan={1}
        funcType={'flat' as FuncType}
        icon="add"
        onClick={() => ds.create()}
      >
        {`添加${label}`}
      </Button>
    </Form>
  );

  const renderEnvOption = ({ record, text }: any) => (
    <>
      <StatusDot
        // @ts-ignore
        connect={record.get('connect')}
        synchronize={record.get('synchro')}
        active={record.get('active')}
        size="small"
      />
      {text}
    </>
  );

  return (
    <div className="c7ncd-appCenterPro-deployGroup">
      <Form columns={3} dataSet={DeployGroupConfigDataSet}>
        <Select
          colSpan={1}
          name={mapping.env.name}
          optionRenderer={renderEnvOption}
          onOption={({ record }) => ({
            disabled: !(record.get('connect') && record.get('synchro') && record.get('permission')),
          })}
        />
        <NumberField
          colSpan={1}
          name={mapping.podNum.name}
          precision={0}
        />
      </Form>
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        title="高级配置"
        content={(
          <Form columns={3} dataSet={DeployGroupConfigDataSet}>
            <TextField
              colSpan={1}
              name={mapping.MaxSurge.name}
            />
            <TextField
              colSpan={1}
              name={mapping.MaxUnavailable.name}
            />
            <Select colSpan={1} name={mapping.DNSPolicy.name} />
          </Form>
        )}
      />
      <CollapseContainer
        title="DNS Config"
        style={{
          marginBottom: 20,
        }}
        content={(
          <div>
            <Form columns={2} dataSet={DeployGroupConfigDataSet}>
              <TextField colSpan={1} name={mapping.Nameservers.name} />
              <TextField colSpan={1} name={mapping.Searches.name} />
            </Form>
            <p>Options</p>
            { getKeyValueRenderByDs(OptionDataSet, 'Options') }
          </div>
        )}
      />
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        title="注解（Annotations）"
        content={getKeyValueRenderByDs(AnnotationsDataSet, '注解')}
      />
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        title="标签（Labels）"
        content={getKeyValueRenderByDs(LabelsDataSet, '标签')}
      />
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        title="节点选择标签"
        content={getKeyValueRenderByDs(NodeLabelsDataSet, '标签')}
      />
      <CollapseContainer
        title="HostAliases"
        content={getKeyValueRenderByDs(HostAliasesDataSet, 'HostAliases')}
      />
    </div>
  );
});

export default Index;
