import React, { useMemo } from 'react';
/* eslint-disable max-len */
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { DataSet } from 'choerodon-ui/pro';
import { middlewareConfigApi } from '@/api/Middleware';
import { Record, FieldType } from '@/interface';
import { appServiceApiConfig } from '@/api/AppService';
import { deployApiConfig, deployApi } from '@/api/Deploy';
import { appServiceVersionApiConfig } from '@/api/AppServiceVersions';
import { environmentApiConfig } from '@/api/Environment';
import {
  appServiceInstanceApi, appServiceInstanceApiConfig, deployAppCenterApi, uniqueApiConfig,
} from '@/api';
import { OPTIONAL } from '../constant';
import hzero from '../images/hzero.png';
import market from '../images/market.png';
import project from '../images/project.png';
import share from '../images/share.png';

const chartSourceData: {
  value: string,
  name: string,
  img: any,
}[] = [{
  value: 'normal',
  name: '项目服务',
  img: project,
}, {
  value: 'share',
  name: '共享服务',
  img: share,
}, {
  value: 'market',
  name: '市场服务',
  img: market,
}, {
  value: 'hzero',
  name: 'HZERO服务',
  img: hzero,
}, {
  value: 'middleware',
  name: '基础组件',
  img: '',
}];

const appServiceOptionsDs = {
  autoQuery: true,
  paging: false,
  fields: [{
    name: 'groupName',
    type: 'string',
    group: 0,
  }] as FieldProps[],
  transport: {
    read: ({ data }: {
      data: {
        type: string,
      }
    }) => ({
      ...appServiceApiConfig.getAppService(true, 'normal', data?.type || 'normal_service'),
      transformResponse: (res: any) => {
        let newRes = res;
        function init(d: {
              name: string,
              appServiceList: object[]
            }[]) {
          let result: {
              groupName: string
            }[] = [];
          d.forEach((item) => {
            const itemData = item.appServiceList.map((i) => ({
              ...i,
              groupName: item.name,
            }));
            result = [
              ...result,
              ...itemData,
            ];
          });
          return result;
        }
        try {
          newRes = JSON.parse(res);
          return init(newRes);
        } catch (e) {
          return init(newRes);
        }
      },
    }),
  },
};

const marketVersionOptionsDs = {
  autoQuery: true,
  fields: [{
    name: 'name',
    type: 'string',
    group: 0,
  }] as FieldProps[],
  paging: false,
  transport: {
    read: ({ data: queryData }: any) => ({
      ...deployApiConfig.deployApplication(queryData.applicationType || 'common'),
      transformResponse: (res: any) => {
        function init(data: any) {
          let result: any = [];
          data.forEach((i: {
            name: string,
            appVersionVOS: {
              id: string
            }[]
          }) => {
            const iData = i.appVersionVOS.map((app: {
              id: string,
            }) => ({
              ...app,
              name: i.name,
              // 如果没有分类 则是选配
              versionId: i.name ? app.id : 'optional',
            }));
            result = [
              ...result,
              ...iData,
            ];
          });
          return result;
        }
        let newRes = res;
        try {
          newRes = JSON.parse(res);
          return init(newRes);
        } catch (e) {
          return init(newRes);
        }
      },
    }),
  },
};

const serviceVersionOptionDs = {
  autoQuery: false,
  paging: true,
  pageSize: 20,
  transport: {
    read: ({ data, params }: any) => ({
      ...appServiceVersionApiConfig.getVersions(data.appServiceId, true, true, params),
    }),
  },
};

const serviceVersionDataSet = new DataSet(serviceVersionOptionDs);

const marketServiceVersionOptionDs = {
  autoQuery: false,
  paging: true,
  pageSize: 20,
  transport: {
    read: ({ data }: any) => {
      if (data.type) {
        // 如果是选配
        if (data.type === OPTIONAL) {
          return ({
            ...uniqueApiConfig.getOptionalService(),
            transformResponse: (res: any) => {
              const newRes = JSON.parse(res);
              return newRes.map((i: any) => ({
                ...i,
                id: i.deployObjectId,
                marketServiceName: i.version,
              }));
            },
          });
        }
      } else if (data.version) {
        // 如果是普通类型查服务版本
        return ({
          ...deployApiConfig.deployVersion(data.version, 'image'),
          transformResponse: (res: any) => {
            function init(dt: any) {
              return dt.map((d: any) => {
                const newD = d;
                newD.id = newD.marketServiceDeployObjectVO.id;
                return d;
              });
            }
            let newRes = res;
            try {
              newRes = JSON.parse(res);
              return init(newRes);
            } catch (e) {
              return init(newRes);
            }
          },
        });
      }
      return undefined;
    },
  },
};

const marketServiceVersionDataSet = new DataSet(marketServiceVersionOptionDs);

const envDataSet = {
  autoQuery: true,
  paging: true,
  transport: {
    read: () => environmentApiConfig.loadEnvList(),
  },
};

const handleUpdate = async ({
  dataSet, name, value, record, detail,
}: any) => {
  switch (name) {
    case mapping.chartSource.name: {
      // eslint-disable-next-line no-param-reassign
      dataSet.getField(mapping.hzeroVersion.name).options.queryParameter = {};
      if (value === chartSourceData[0].value) {
        dataSet.getField(mapping.hzeroVersion.name).options.setQueryParameter('type', 'normal_service');
        dataSet.getField(mapping.hzeroVersion.name).options.query();
      } else if (value === chartSourceData[1].value) {
        dataSet.getField(mapping.hzeroVersion.name).options.setQueryParameter('type', 'share_service');
        dataSet.getField(mapping.hzeroVersion.name).options.query();
      } else if (value === chartSourceData[2].value) {
        dataSet.getField(mapping.marketVersion.name).options.setQueryParameter('applicationType', 'common');
        dataSet.getField(mapping.marketVersion.name).options.query();
      } else {
        dataSet.getField(mapping.marketVersion.name).options.setQueryParameter('applicationType', 'hzero');
        dataSet.getField(mapping.marketVersion.name).options.query();
      }
      dataSet.current.set(mapping.hzeroVersion.name, undefined);
      dataSet.current.set(mapping.marketVersion.name, undefined);
      dataSet.current.set(mapping.serviceVersion.name, undefined);
      dataSet.current.set(mapping.marketServiceVersion.name, undefined);
      dataSet.current.set(mapping.originValue.name, undefined);
      break;
    }
    case mapping.serviceVersion.name: {
      if (value) {
        let getYamlValues:{yaml:string};
        if (detail && 'instanceId' in detail) {
          getYamlValues = await appServiceInstanceApi.getValues(detail?.instanceId, value);
        } else {
          getYamlValues = await appServiceInstanceApi.getDeployValue(value);
        }
        record.set(mapping.value.name, getYamlValues?.yaml);
        record.set(mapping.originValue.name, getYamlValues?.yaml);
      }
      break;
    }
    case mapping.marketServiceVersion.name: {
      if (value) {
        const res = await deployApi.getValue(record.get(mapping.marketVersion.name) === OPTIONAL ? value.deployObjectId : value.id);
        record.set(mapping.value.name, res?.value);
        record.set(mapping.originValue.name, res?.value);
      }
      break;
    }
    case mapping.hzeroVersion.name: {
      record.set(mapping.serviceVersion.name, undefined);
      record.set(mapping.value.name, '');
      serviceVersionDataSet.setQueryParameter('appServiceId', value);
      serviceVersionDataSet.query();
      break;
    }
    case mapping.marketVersion.name: {
      record.set(mapping.marketServiceVersion.name, undefined);
      record.set(mapping.value.name, '');
      record.set(mapping.originValue.name, '');
      switch (value) {
        // 如果是选配
        case OPTIONAL: {
          marketServiceVersionDataSet.setQueryParameter('type', value);
          marketServiceVersionDataSet.query();
          break;
        }
        default: {
          marketServiceVersionDataSet.setQueryParameter('version', value);
          marketServiceVersionDataSet.query();
          break;
        }
      }
    }
    default: {
      break;
    }
  }
};

const mapping: {
  [key: string]: FieldProps;
} = {
  appName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
  },
  appCode: {
    name: 'code',
    type: 'string' as FieldType,
    label: '应用编码',
  },
  chartSource: {
    name: 'chartSource',
    type: 'string' as FieldType,
    label: 'Chart包来源',
    valueField: 'value',
    textField: 'name',
    defaultValue: chartSourceData[0].value,
    options: new DataSet({
      data: chartSourceData,
    }),
  },
  hzeroVersion: {
    name: 'appServiceId',
    type: 'string' as FieldType,
    label: '应用服务',
    textField: 'name',
    valueField: 'id',
    options: new DataSet(appServiceOptionsDs),
    dynamicProps: {
      required: ({ record }) => [chartSourceData[0].value, chartSourceData[1].value]
        .includes(record.get(mapping.chartSource.name)),
    },
  },
  marketVersion: {
    name: 'marketAppServiceId',
    type: 'string' as FieldType,
    label: '市场应用及版本',
    textField: 'versionNumber',
    valueField: 'versionId',
    options: new DataSet(marketVersionOptionsDs),
    dynamicProps: {
      required: ({ record }) => ![chartSourceData[0].value, chartSourceData[1].value]
        .includes(record.get(mapping.chartSource.name)),
    },
  },
  serviceVersion: {
    name: 'appServiceVersionId',
    type: 'string' as FieldType,
    label: '服务版本',
    textField: 'version',
    valueField: 'id',
    options: serviceVersionDataSet,
    dynamicProps: {
      disabled: ({ record }) => !record.get(mapping.hzeroVersion.name),
      required: ({ record }) => [chartSourceData[0].value, chartSourceData[1].value]
        .includes(record.get(mapping.chartSource.name)),
      // lookupAxiosConfig: ({ record }) => {
      //  if (record.get(mapping.hzeroVersion.name)) {
      //    return ({
      //      ...appServiceVersionApiConfig
      //        .getVersions(record.get(mapping.hzeroVersion.name), true, true),
      //    });
      //  }
      //  return undefined;
      // },
    },
  },
  value: {
    name: 'values',
    type: 'string' as FieldType,
    defaultValue: '',
  },
  originValue: {
    name: 'originValues',
    type: 'string' as FieldType,
    defaultValue: '',
  },
  marketServiceVersion: {
    name: 'marketDeployObjectId',
    type: 'object' as FieldType,
    label: '市场服务及版本',
    textField: 'marketServiceName',
    valueField: 'id',
    options: marketServiceVersionDataSet,
    dynamicProps: {
      disabled: ({ record }) => !record.get(mapping.marketVersion.name),
      required: ({ record }) => ![chartSourceData[0].value, chartSourceData[1].value]
        .includes(record.get(mapping.chartSource.name)),
      // lookupAxiosConfig: ({ record }) => (record.get(mapping.marketVersion.name) ? ({
      //  ...deployApiConfig.deployVersion(record.get(mapping.marketVersion.name), 'image'),
      //  transformResponse: (res: any) => {
      //    function init(dt: any) {
      //      return dt.map((d: any) => {
      //        const newD = d;
      //        newD.id = newD.marketServiceDeployObjectVO.id;
      //        return d;
      //      });
      //    }
      //    let newRes = res;
      //    try {
      //      newRes = JSON.parse(res);
      //      return init(newRes);
      //    } catch (e) {
      //      return init(newRes);
      //    }
      //  },
      // }) : undefined),
    },
  },
  env: {
    name: 'environmentId',
    type: 'string' as FieldType,
    label: '环境',
    required: true,
    options: new DataSet(envDataSet),
    textField: 'name',
    valueField: 'id',
  },
};

const appConfigDataSet = (envId?: string, detail?: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'env': {
        if (envId) {
          item.disabled = true;
        }
        if (!detail) {
          item.required = false;
        }
        break;
      }
      case 'appName': {
        if (detail) {
          item.validator = async (value, type, record: Record) => {
            let res: any = '应用名称已重复';
            const flag = await deployAppCenterApi.checkAppName(value, 'chart', record?.get('instanceId') || record?.get('id'), record.get(mapping.env.name));
            if (flag) {
              res = true;
            }
            return res;
          };
        } else {
          item.validator = async () => true;
        }
        break;
      }
      case 'hzeroVersion': {
        if (detail) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
        break;
      }
      case 'marketVersion': {
        item.disabled = Boolean(detail);
        break;
      }
      case 'marketServiceVersion': {
        // @ts-ignore
        item.dynamicProps.disabled = ({ record }: { record: Record }) => !(record.get(mapping.marketVersion.name) && !detail);
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
  transport: {
    update: ({ data: [data] }: any) => {
      if ([chartSourceData[0].value, chartSourceData[1].value]
        .includes(data[mapping.chartSource.name as string])) {
        return appServiceInstanceApiConfig.updateAppServiceInstance({
          ...data,
          appName: data[mapping.appName.name as string],
          appCode: data[mapping.appCode.name as string],
          instanceId: data?.id || data?.instanceId,
        });
      } if (data[mapping.chartSource.name as string] === chartSourceData[4].value) {
        return middlewareConfigApi.updateMiddleware(data.id || data.instanceId, {
          ...data,
          marketAppServiceId: data.appServiceId,
        });
      }
      return appServiceInstanceApiConfig.updateMarketAppService(
        data.instanceId,
        {
          ...data,
          appName: data[mapping.appName.name as string],
          appCode: data[mapping.appCode.name as string],
          instanceId: data?.id || data?.instanceId,
          marketAppServiceId: data[mapping.hzeroVersion.name as string],
        },
      );
    },
  },
  events: {
    update: async ({
      dataSet,
      name,
      value,
      record,
    }: {
        dataSet: any,
        name: string,
        value: any,
        record: any,
      }) => {
      handleUpdate({
        dataSet, name, value, record, detail,
      });
    },
    create: ({ record }: {
        record: Record,
      }) => {
      if (envId) {
        record.set(mapping.env.name as string, envId);
      }
    },
    load: ({ dataSet }: {
        dataSet: DataSet,
      }) => {
      const data = dataSet?.current?.toData();
      if (data[mapping.hzeroVersion.name as string]
          && [chartSourceData[0].value, chartSourceData[1].value].includes(data[mapping.chartSource.name as string])
      ) {
        serviceVersionDataSet.setQueryParameter('appServiceId', data[mapping.hzeroVersion.name as string]);
        serviceVersionDataSet.query();
      }
      if (data[mapping.marketVersion.name as string]
          && [chartSourceData[2].value, chartSourceData[3].value].includes(data[mapping.chartSource.name as string])
      ) {
        marketServiceVersionDataSet.setQueryParameter('version', data[mapping.marketVersion.name as string]);
        marketServiceVersionDataSet.query();
      }
    },
  },
});

export default appConfigDataSet;

export { mapping, chartSourceData, envDataSet };
