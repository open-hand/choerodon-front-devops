import React, { useEffect, useImperativeHandle } from 'react';
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
import Tips from '@/components/new-tips';

const setOptionsDs = (ds: any, data: any) => {
  ds.loadData(Object.entries(data).map((item: any) => ({
    key: item[0],
    value: item[1],
  })));
};

const Index = observer(() => {
  const {
    cRef,
    DeployGroupConfigDataSet,
    OptionDataSet,
    AnnotationsDataSet,
    LabelsDataSet,
    NodeLabelsDataSet,
    HostAliasesDataSet,
    detail,
    modal,
    refresh,
  } = useDeployGroupConfigStore();

  useEffect(() => {
    if (typeof (detail) === 'object') {
      setOptionsDs(OptionDataSet, detail.appConfig.options);
      setOptionsDs(AnnotationsDataSet, detail.appConfig.annotations);
      setOptionsDs(LabelsDataSet, detail.appConfig.labels);
      setOptionsDs(NodeLabelsDataSet, detail.appConfig.nodeSelector);
      setOptionsDs(HostAliasesDataSet, detail.appConfig.hostAlias);
      DeployGroupConfigDataSet.loadData([{
        ...detail,
        ...detail.appConfig,
        [mapping.env.name as string]: detail.environmentId,
      }]);
    }
  }, []);

  const handleOk = async () => {
    const dsList = [
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
    if (!flag) {
      DeployGroupConfigDataSet.setQueryParameter('dsList', {
        options: OptionDataSet.toData(),
        annotations: AnnotationsDataSet.toData(),
        labels: LabelsDataSet.toData(),
        nodeLabels: NodeLabelsDataSet.toData(),
        hostAliases: HostAliasesDataSet.toData(),
      });
      const res = await DeployGroupConfigDataSet.submit();
      if (res !== false) {
        if (refresh) {
          refresh();
        }
        return true;
      }
      return false;
    }
    return false;
  };

  if (modal) {
    modal.handleOk(handleOk);
  }

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
              <div className="c7ncd-appCenterPro-deployGroup__options__item__fieldDiv">
                <TextField name="key" />
              </div>
              <span className="c7ncd-appCenterPro-deployGroup__options__item__equal">=</span>
              <div className="c7ncd-appCenterPro-deployGroup__options__item__fieldDiv">
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
      <span
        style={{
          marginLeft: 4,
          position: 'relative',
          top: 1,
        }}
      >
        {text}
      </span>
    </>
  );

  return (
    <div
      className="c7ncd-appCenterPro-deployGroup"
      style={{
        marginTop: detail ? 'unset' : '30px',
      }}
    >
      <Form columns={3} dataSet={DeployGroupConfigDataSet}>
        {
          detail && [
            <TextField name={mapping.appName.name} />,
            <TextField name={mapping.appCode.name} />,
          ]
        }
        <Select
          newLine
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
        defaultCollapse
        title="高级配置"
        content={(
          <Form columns={3} dataSet={DeployGroupConfigDataSet}>
            <TextField
              colSpan={1}
              name={mapping.MaxSurge.name}
              addonAfter={<Tips helpText="升级过程中，允许【超出副本数量的实例】的最大数量。" />}
            />
            <TextField
              colSpan={1}
              name={mapping.MaxUnavailable.name}
              addonAfter={<Tips helpText="升级过程中，不可用实例的最大数量。" />}
            />
            <Select
              colSpan={1}
              name={mapping.DNSPolicy.name}
              addonAfter={<Tips helpText="可以为每个 Pod 设置 DNS 策略，详情请参考 kubernetes 文档。" />}
            />
          </Form>
        )}
      />
      <CollapseContainer
        title="DNS Config"
        helpText="为 Pod 设置 DNS 参数，设置的参数将合并到基于 dnsPolicy 策略生成的域名解析文件中，详情请参考 kubernetes 文档。"
        style={{
          marginBottom: 20,
        }}
        content={(
          <div>
            <Form columns={2} dataSet={DeployGroupConfigDataSet}>
              <TextField
                colSpan={1}
                name={mapping.Nameservers.name}
                addonAfter={<Tips helpText="容器解析域名时查询的 DNS 服务器的 IP 地址列表。最多可以指定 3 个 IP 地址" />}
              />
              <TextField
                colSpan={1}
                name={mapping.Searches.name}
                addonAfter={<Tips helpText="定义域名的搜索域列表。可选，Kubernetes 最多允许 6 个搜索域。" />}
              />
            </Form>
            <p>
              Options
              <span>
                <Tips helpText="定义域名解析配置文件的其他选项，常见的有 timeout、attempts 和 ndots 等等。" />
              </span>
            </p>
            { getKeyValueRenderByDs(OptionDataSet, 'Options') }
          </div>
        )}
      />
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        defaultCollapse
        title="注解（Annotations)"
        helpText="即 kubernetes 中的 annotations，详情请参考 kubernetes 文档。"
        content={getKeyValueRenderByDs(AnnotationsDataSet, '注解')}
      />
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        defaultCollapse
        title="标签（Label)"
        helpText="即 kubernetes中的Labels，详情请参考 kubernetes 文档。"
        content={getKeyValueRenderByDs(LabelsDataSet, '标签')}
      />
      <CollapseContainer
        style={{
          marginBottom: 20,
        }}
        defaultCollapse
        title="节点选择标签"
        helpText="节点选择标签即 kubernetes 中的 nodeSelector，详情请参考 kubernetes文档。"
        content={getKeyValueRenderByDs(NodeLabelsDataSet, '标签')}
      />
      <CollapseContainer
        defaultCollapse
        title="HostAliases"
        helpText="HostAliases 向 Pod /etc/hosts 文件添加条目，详情请参考 k8s 的 HostAliases文档。"
        content={getKeyValueRenderByDs(HostAliasesDataSet, 'HostAliases')}
      />
    </div>
  );
});

export default Index;

export { setOptionsDs };
