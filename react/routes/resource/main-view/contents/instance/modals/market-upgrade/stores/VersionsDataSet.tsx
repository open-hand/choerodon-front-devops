import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Record, DataSetProps, DataSetSelection } from '@/interface';

interface VersionProps {
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  marketDeployObjectId: string,
  marketAppServiceId: string,
}

export default ({
  formatMessage, intlPrefix, projectId, marketDeployObjectId, marketAppServiceId,
}: VersionProps): DataSetProps => {
  function handleLoad({ dataSet }: { dataSet: DataSet}) {
    if (dataSet.totalCount) {
      const record = dataSet.find((eachRecord: Record) => eachRecord.get('id') === marketDeployObjectId);
      record && record.set('marketServiceVersion', `${record.get('marketServiceVersion')} (${formatMessage({ id: `${intlPrefix}.instance.current.version` })})`);
    }
  }
  return ({
    autoCreate: false,
    autoQuery: true,
    selection: 'single' as DataSetSelection,
    paging: false,
    transport: {
      read: {
        url: `/market/v1/projects/${projectId}/deploy/application/version/upgrade/${marketDeployObjectId}?market_service_id=${marketAppServiceId}`,
        method: 'get',
      },
    },
    events: {
      load: handleLoad,
    },
  });
};
