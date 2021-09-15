import { DataSet } from 'choerodon-ui/pro';
import omit from 'lodash/omit';
import { Record, DataSetProps, FieldType } from '@/interface';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
}

export default ({
  formatMessage,
  intlPrefix,
}: FormProps): DataSetProps => ({
  autoCreate: false,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  fields: [
    {
      name: 'mktServiceVersion',
      label: formatMessage({ id: `${intlPrefix}.version.service` }),
      required: true,
    },
    {
      name: 'instanceCode',
      label: formatMessage({ id: 'instanceName' }),
      required: true,
    },
    {
      name: 'startTime',
      label: formatMessage({ id: `${intlPrefix}.deploymentStartTime` }),
      required: true,
    },
    {
      name: 'endTime',
      required: true,
    },
    {
      name: 'appStatus',
      required: true,
    },
    {
      name: 'appId',
      required: true,
    },
    {
      name: 'appName',
      required: true,
      label: '应用名称',
    },
    { name: 'value' },
  ],
});
