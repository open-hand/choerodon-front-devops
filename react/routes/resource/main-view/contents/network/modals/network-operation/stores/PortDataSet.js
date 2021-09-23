/* eslint-disable */
import detailTabs from '@/routes/app-center-pro/routes/app-detail/components/detail-tabs';
import { map } from 'lodash';
import {deploymentsApiConfig} from '@/api/Deployments'
export default ({ formatMessage, projectId, envId }) => {
  /**
   * 验证端口号
   * @param value
   * @param type
   * @param record
   */
  function checkPort(value, type, record) {
    const p = /^([1-9]\d*|0)$/;
    const isRepeat = record.dataSet.findIndex((r) => record.id !== r.id && r.get(type) === value) !== -1;
   
    const data = {
      typeMsg: '',
      min: 0,
      max: 65535,
      failedMsg: 'network.port.check.failed',
    };
    
    switch (type) {
      case 'nodePort':
        data.typeMsg = 'network.nport.check.repeat';
        data.min = 30000;
        data.max = 32767;
        data.failedMsg = 'network.nport.check.failed';
        break;
      case 'port':
        data.typeMsg = 'network.port.check.repeat';//端口号重复
    }
    if(isRepeat){
      return formatMessage({ id:  data.typeMsg  });
    }
    if (value) {
      if (
        p.test(value)
        && parseInt(value, 10) >= data.min
        && parseInt(value, 10) <= data.max
      ) {
        return true;
      }
      return formatMessage({ id: data.failedMsg });
    }
  }
  const transformResponse=(resp) => {
    try {
      const data = JSON.parse(resp);
      if (data && data.failed) {
        return data;
      }
      return map(data, (item, index) => ({
        ...item,
        codePort: `${item.resourceName}: ${item.portValue}`,
      }));
    } catch (e) {
      return resp;
    }
  }
  return {
    fields: [
      {
        name: 'nodePort',
        type: 'string',
        label: formatMessage({ id: 'network.config.nodePort' }),
        validator: checkPort,
      },
      {
        name: 'port',
        type: 'string',
        label: formatMessage({ id: 'network.config.port' }),
        required: true,
        validator: checkPort,
      },
      {
        name: 'targetPort',
        type: 'string',
        label: formatMessage({ id: 'network.config.targetPort' }),
        required: true,
        validator: checkPort,
        valueField: 'codePort',
        textField: 'resourceName',
        dynamicProps: {
          lookupAxiosConfig: ({ dataSet, record, name }) => {
            if(dataSet.parent.current.get('target')!=='instance'){
              return null;}
            if(dataSet.parent.current.get('isChart')==='chart'){
            if (!dataSet.parent.current || !dataSet.parent.current.get('appServiceId')) return null;
            return {
              method: 'get',
              url: `/devops/v1/projects/${projectId}/env/app_services/list_port?env_id=${envId}&app_service_id=${dataSet.parent.current.get('appServiceId')}`,
              transformResponse: (resp) => {
                try {
                  const data = JSON.parse(resp);
                  if (data && data.failed) {
                    return data;
                  }
                  return map(data, (item, index) => ({
                    ...item,
                    codePort: `${item.resourceName}: ${item.portValue}`,
                  }));
                } catch (e) {
                  return resp;
                }
              },
            };
          }else{
            if (!dataSet.parent.current || !dataSet.parent.current.get('appDeploy')) return null;
           return deploymentsApiConfig.getTargetPort(dataSet.parent.current.get('appDeploy'),transformResponse);
          }
          },
        },
      },
      {
        name: 'protocol',
        type: 'string',
        label: formatMessage({ id: 'ist.deploy.ports.protocol' }),
        dynamicProps: {
          required: ({ dataSet, record, name }) => {
            if (!dataSet.parent.current) return false;
            return dataSet.parent.current.get('type') === 'NodePort';
          },
        },
      },
    ],
    events: {
      update: updateEventHandler,
    },
  };
};

function updateEventHandler({
  dataSet, record, name, value, oldValue,
}) {
  if (name === 'targetPort') {
    if (value && value.indexOf(':') >= 0) {
      record.set(name, value.slice(value.indexOf(':') + 2));
    }
  }
  // 对于在 targetPort，nodePort,port这几个字段，当值发生改变时，对其余记录进行校验
  if (name !== 'protocol') {
    checkOtherRecords(record, name);
  }
}

function checkOtherRecords(record, type) {
  record.dataSet.forEach((r) => {
    if (r.id !== record.id) {
      // 此处只对重复性做校验，不对空值做校验
      if (r.get(type)) {
        r.getField(type).checkValidity();
      }
    }
  });
}
