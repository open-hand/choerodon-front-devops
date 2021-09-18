/* eslint-disable */
import { map, forOwn, isEmpty, forEach } from 'lodash';
import { axios } from '@choerodon/boot';

export default ({ formatMessage, portDs, targetLabelsDs, appInstanceOptionsDs, networkStore, projectId, envId, appId, networkEdit }:any):any => {
  const { networkInfoDs, networkId, initTargetLabel, initPorts } = networkEdit;

  function checkNetWorkName(projectId: any, envId: any, value: any) {
    return axios.get(`/devops/v1/projects/${projectId}/service/check_name?env_id=${envId}&name=${value}`);
  }

  /**
  * 检查名字的唯一性
  * @param value
  * @param name
  * @param record
  */
  async function checkName(value:any, name:string, record:any) {
    if (networkId) return;

    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && !pattern.test(value)) {
      return formatMessage({ id: 'network.name.check.failed' });
    } else if (value && pattern.test(value)) {
      const res = await checkNetWorkName(projectId, envId, value);
      if (!res) {
        return formatMessage({ id: 'network.name.check.exist' });
      }
    }
  }

  /**
   * 验证ip
   * @param value
   * @param name
   * @param record
   */
  function checkIP(value: string, name: any, record: any) {
    const p = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
    let errorMsg;
    if (value) {
      if (!p.test(value)) {
        errorMsg = formatMessage({ id: 'network.ip.check.failed' });
      }
      return errorMsg;
    }
  }


  function checkInstance(value: string, name: any, record: any) {
    if (!networkId) return;
    let msg: any;
    if (value) {
      const data = value.split(',');
      forEach(data, (item: any) => {
        const instance = appInstanceOptionsDs.find((r: { get: (arg0: string) => any; }) => r.get('code') === item);
        let status;
        if(instance){
          status = instance.get('status');
        }
        if (instance && status && status !== 'running' && !msg) {
          msg = formatMessage({ id: 'network.instance.check.failed' });
        }
      });
      if (data[1] && !msg) {
        msg = formatMessage({ id: 'network.instance.check.failed.more' });
      }
    }
    if (msg) {
      return msg;
    }
  }

  return {
    autoCreate: true,
    children: {
      portDs,
      targetLabelsDs,
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: formatMessage({ id: 'network.form.name' }),
        required: true,
        validator: checkName,
      },
      {
        name: 'target',
        type: 'string',
        defaultValue: 'instance',
      },
      {
        name: 'type',
        type: 'string',
        defaultValue: 'ClusterIP',
      },
      {
        name: 'appInstance',
        type: 'string',
        label: formatMessage({ id: 'network.target.instance' }),
        required: true,
        options: appInstanceOptionsDs,
        textField: 'code',
        valueField: 'code',
        validator: checkInstance,
        dynamicProps: {
          required: ({ dataSet, record, name }:any) => record.get('target') !== 'param',
        },
      },
      {
        name: 'externalIps',
        label: formatMessage({ id: 'network.config.ip' }),
        multiple: true,
        validator: checkIP,
      },
    ],
    transport: {
      create: ({ data: [data] }:any) => ({
        method: 'post',
        url: `/devops/v1/projects/${projectId}/service`,
        data: transFormData(data, formatMessage, appId, envId),
      }),
    },
    events: {
      update({ dataSet, record, name, value, oldValue }:any) {
        switch (name) {
          case 'target':
            networkId
              ? record.init('instance', initTargetLabel({ targetLabelsDs, type: value, record, networkInfoDs, formatMessage }))
              : handleTargetChange({ targetLabelsDs, value, record, dataSet });
            break;
          case 'type':
            networkId
              ? record.init('externalIps', initPorts({ portDs, type: value, networkInfoDs }))
              : handleTypeChange({ portDs, value, record });
            break;
          default:
            break;
        }
      },
    },
  };
};

function handleTargetChange({ targetLabelsDs, value, record }:any) {
  const isParam = value === 'param';
  if (isParam) {
    record.set('appInstance', null);
  } else {
    targetLabelsDs.reset();
    targetLabelsDs.create();
  }
}


function handleTypeChange({ portDs, value, record }:any) {
  portDs.reset();
  portDs.create();
  if (value !== 'ClusterIP') {
    record.set('externalIps', null);
  }
}


export function transFormData(data: { portDs: any; targetLabelsDs: any; target: any; appInstance: any; name: any; type: any; externalIps: any; }, formatMessage: (arg0: { id: string; }) => any, appId: any, envId: any) {
  const { portDs: portData, targetLabelsDs: targetLabelsData, target, appInstance, name, type, externalIps } = data;

  // NOTE: 转换port的数据，过滤掉不用的数据
  const ports = map(portData, (value: { port: any; targetPort: any; nodePort: any; protocol: any; }) => ({
    port: value.port,
    targetPort: value.targetPort,
    nodePort: value.nodePort,
    protocol: value.protocol,
  }));

  let targetAppServiceId;
  let targetInstanceCode;
  let selectors:any = null;
  // 目标对象是实例还是选择器
  if (target === 'instance') {
    /**
     * NOTE: 处理所有实例和单个实例的问题
     * 所有实例直接与AppService关联所以此处赋值给targetAppServiceId
     * 单个实例直接与AppInstnace关联所以此处赋值给targetInstanceCode
     */
    if (appInstance === formatMessage({ id: 'all_instance' })) {
      targetAppServiceId = appId;
    } else {
      targetInstanceCode = appInstance;
    }
  } else {
    // NOTE: 处理selectors,将targetLabels的数组转换成key，value的对象
    selectors = {};
    forOwn(targetLabelsData, (value: { keyword: string | number; value: any; }, key: any) => {
      if (value) {
        selectors[value.keyword] = value.value;
      }
    });
    if (isEmpty(selectors)) {
      selectors = null;
    }
  }

  let externalIp;
  if (externalIps) {
    const ips = externalIps.join(',');
    externalIp = ips || null;
  }

  return {
    appServiceId: appId,
    envId,
    targetInstanceCode,
    targetAppServiceId,
    name,
    externalIp,
    type,
    ports,
    selectors,
    endPoints: null,
  };
}
