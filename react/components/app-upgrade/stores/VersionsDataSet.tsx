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
}: VersionProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: 'single' as DataSetSelection,
  paging: false,
  transport: {
    read: {
      url: `/market/v1/projects/${projectId}/deploy/application/version/upgrade/${marketAppServiceId}?deploy_object_id=${marketDeployObjectId}`,
      method: 'get',
    },
  },
});
