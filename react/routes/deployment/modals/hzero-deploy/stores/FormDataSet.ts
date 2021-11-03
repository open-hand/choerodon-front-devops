/* eslint-disable no-param-reassign */

import { map, isEmpty, pick } from 'lodash';
import uuidV1 from 'uuid/v1';
import {
  DataSet, DataSetProps, FieldType, UpdateEventProps, DataSetStatus,
} from '@/interface';
import {
  environmentApiConfig,
  marketHzeroApiConfig,
  marketHzeroApi,
  deployApiConfig,
} from '@/api';
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
    if (name === 'mktAppVersion') {
      if (value) {
        serviceDs.status = 'loading' as DataSetStatus;
        const serviceData = await marketHzeroApi.loadHzeroServices(
          record.get('mktAppId'),
          record.get('mktAppVersion')?.id,
        );
        const newServiceData = map(serviceData, (item: ServiceItemProps) => ({
          ...item,
          values: item?.marketServiceDeployObjectVO?.value,
          marketServiceVersion: item?.marketServiceDeployObjectVO?.marketServiceVersion,
          instanceName: getInstanceName(item?.marketServiceCode),
        }));
        serviceDs.loadData(newServiceData || []);
        mainStore.setServiceData(newServiceData || []);
        serviceDs.status = 'ready' as DataSetStatus;
      } else {
        serviceDs.removeAll();
      }
    }
    if (name === 'appType') {
      const field = record.getField('mktAppVersion');
      field?.reset();
      serviceDs.removeAll();
      const appVersionData = await field?.fetchLookup();
      if (!isEmpty(appVersionData)) {
        record.set({
          // @ts-ignore
          mktAppId: appVersionData[0]?.marketAppId,
          // @ts-ignore
          mktAppVersion: appVersionData[0],
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
      submit: ({ data: [data] }) => {
        const postData = pick(data, 'envId', 'mktAppId');
        postData.mktAppVersion = data.mktAppVersion?.versionNumber;
        postData.deployDetailsVOList = serviceDs.map((record) => ({
          sequence: record.get('sequence'),
          value: record.get('values'),
          mktServiceId: record.get('id'),
          instanceCode: record.get('instanceName'),
          mktDeployObjectId: record.get('marketServiceDeployObjectVO')?.id,
        }));
        return deployApiConfig.deployHzero(postData);
      },
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
        name: 'envId',
        textField: 'name',
        valueField: 'id',
        label: formatMessage({ id: 'environment' }),
        required: true,
        lookupAxiosConfig: () => environmentApiConfig.loadEnvList({ random }),
      },
      {
        name: 'mktAppVersion',
        type: 'object' as FieldType,
        label: formatMessage({ id: `${intlPrefix}.version` }),
        textField: 'versionNumber',
        valueField: 'id',
        required: true,
        dynamicProps: {
          lookupAxiosConfig: ({ record }) => marketHzeroApiConfig.loadHzeroVersions(record.get('appType')),
        },
      },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
