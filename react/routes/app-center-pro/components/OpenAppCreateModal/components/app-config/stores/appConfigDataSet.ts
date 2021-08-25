import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSet } from 'choerodon-ui/pro';
import { appServiceApiConfig } from '@/api/AppService';
import { deployApiConfig } from '@/api/Deploy';
import { appServiceVersionApiConfig } from '@/api/AppServiceVersions';
import { environmentApiConfig } from '@/api/Environment';
import hzero from '../images/hzero.png';
import market from '../images/market.png';
import project from '../images/project.png';
import share from '../images/share.png';

const chartSourceData = [{
  value: 'project',
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
  name: 'Hzero服务',
  img: hzero,
}];

const appServiceOptionsDs = {
  autoQuery: true,
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
              versionId: app.id,
              name: i.name,
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
  transport: {
    read: ({ data }: any) => ({
      ...appServiceVersionApiConfig.getVersions(data.appServiceId, true, true),
    }),
  },
};

const marketServiceVersionOptionDs = {
  autoQuery: false,
  paging: true,
  transport: {
    read: ({ data }: any) => ({
      ...deployApiConfig.deployVersion(data.version, 'image'),
    }),
  },
};

const envDataSet = {
  autoQuery: true,
  paging: true,
  transport: {
    read: () => environmentApiConfig.loadEnvList(),
  },
};

const mapping: {
  [key: string]: FieldProps;
} = {
  chartSource: {
    name: 'chartSource',
    type: 'string' as FieldType,
    label: 'Chart包来源',
    defaultValue: chartSourceData[0].value,
  },
  hzeroVersion: {
    name: 'hzeroVersion',
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
    name: 'marketVersion',
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
    name: 'serviceVersion',
    type: 'string' as FieldType,
    label: '服务版本',
    textField: 'version',
    valueField: 'id',
    options: new DataSet(serviceVersionOptionDs),
    dynamicProps: {
      required: ({ record }) => [chartSourceData[0].value, chartSourceData[1].value]
        .includes(record.get(mapping.chartSource.name)),
    },
  },
  marketServiceVersion: {
    name: 'marketServiceVersion',
    type: 'string' as FieldType,
    label: '市场服务及版本',
    textField: 'marketServiceName',
    valueField: 'id',
    options: new DataSet(marketServiceVersionOptionDs),
    dynamicProps: {
      required: ({ record }) => ![chartSourceData[0].value, chartSourceData[1].value]
        .includes(record.get(mapping.chartSource.name)),
    },
  },
  env: {
    name: 'env',
    type: 'string' as FieldType,
    label: '环境',
    required: true,
    options: new DataSet(envDataSet),
    textField: 'name',
    valueField: 'id',
  },
};

const appConfigDataSet = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
  events: {
    update: ({
      dataSet,
      name,
      value,
    }: {
      dataSet: any,
      name: string,
      value: string,
      record: any,
    }) => {
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
          break;
        }
        case mapping.hzeroVersion.name: {
          if (value) {
            dataSet.getField(mapping.serviceVersion.name).options.setQueryParameter('appServiceId', value);
            dataSet.getField(mapping.serviceVersion.name).options.query();
          }
          break;
        }
        case mapping.marketVersion.name: {
          if (value) {
            dataSet.getField(mapping.marketServiceVersion.name).options.setQueryParameter('version', value);
            dataSet.getField(mapping.marketServiceVersion.name).options.query();
          }
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export default appConfigDataSet;

export { mapping, chartSourceData, envDataSet };
