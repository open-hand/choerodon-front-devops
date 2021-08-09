import {
  DataSet, DataSetProps, FieldType, UpdateEventProps,
} from '@/interface';
import { environmentApiConfig, marketHzeroApiConfig, marketHzeroApi } from '@/api';
import JSONBig from 'json-bigint';
import { map, isEmpty } from 'lodash';
import uuidV1 from 'uuid/v1';
import { StoreProps } from './useStore';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  serviceDs: DataSet,
  typeDs: DataSet,
  random: number,
  mainStore: StoreProps,
}

export interface ServiceItemProps {
  marketServiceDeployObjectVO: {
    value: string,
    marketServiceVersion: string,
  }
  id: string,
  marketServiceCode: string,
  marketServiceName: string,
  required: boolean,
}

function getInstanceName(code: string) {
  const randomString = uuidV1();
  return code ? `${code}-${randomString.slice(0, 5)}` : randomString.slice(0, 30);
}

export default ({
  formatMessage,
  intlPrefix,
  serviceDs,
  random,
  typeDs,
  mainStore,
}: FormProps): DataSetProps => {
  async function handleUpdate({ value, name, record }: UpdateEventProps) {
    if (name === 'appVersionId') {
      if (value) {
        const serviceData = await marketHzeroApi.loadHzeroServices(
          mainStore.getApplicationId,
          record.get('appVersionId'),
        );
        const newServiceData = map(serviceData, (item: ServiceItemProps) => ({
          ...item,
          values: item?.marketServiceDeployObjectVO?.value,
          marketServiceVersion: item?.marketServiceDeployObjectVO?.marketServiceVersion,
          instanceName: getInstanceName(item?.marketServiceCode),
        }));
        serviceDs.loadData(newServiceData || []);
        mainStore.setServiceData(newServiceData || []);
      } else {
        serviceDs.removeAll();
      }
    }
    if (name === 'appType') {
      const field = record.getField('appVersionId');
      const appVersionData = await field?.fetchLookup();
      if (!isEmpty(appVersionData)) {
        record.set({
          // @ts-ignore
          appVersionId: appVersionData[0]?.id,
          applicationId: mainStore.getApplicationId,
        });
      }
    }
  }

  return ({
    autoCreate: true,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: false,
    children: { hzeroService: serviceDs },
    transport: {

    },
    fields: [
      {
        name: 'appType',
        textField: 'text',
        valueField: 'value',
        label: formatMessage({ id: `${intlPrefix}.type` }),
        options: typeDs,
      },
      {
        name: 'environmentId',
        textField: 'name',
        valueField: 'id',
        label: formatMessage({ id: 'environment' }),
        required: true,
        lookupAxiosConfig: () => environmentApiConfig.loadEnvList({ random }),
      },
      {
        name: 'appVersionId',
        label: formatMessage({ id: `${intlPrefix}.version` }),
        textField: 'versionNumber',
        valueField: 'id',
        required: true,
        dynamicProps: {
          lookupAxiosConfig: ({ record }) => ({
            ...marketHzeroApiConfig.loadHzeroVersions(record.get('appType')),
            transformResponse: (response: string) => {
              try {
                const data = JSONBig.parse(response);
                if (data && data.failed) {
                  return data;
                }
                const appVersionVOS = data?.appVersionVOS || [];
                mainStore.setApplicationId(data?.id);
                return appVersionVOS;
              } catch (e) {
                return response;
              }
            },
          }),
        },
      },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
