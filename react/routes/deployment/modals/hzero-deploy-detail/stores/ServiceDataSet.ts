import { DataSet } from 'choerodon-ui/pro';
import omit from 'lodash/omit';
import { Record, DataSetProps, FieldType } from '@/interface';
import { axios } from '@choerodon/boot';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
}: FormProps): DataSetProps => ({
  autoCreate: false,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  fields: [
    {
      name: 'serviceVersionId',
      required: true,
    },
    {
      name: 'serviceVersionName',
      label: formatMessage({ id: `${intlPrefix}.version.service` }),
      required: true,
    },
    {
      name: 'instanceName',
      label: formatMessage({ id: 'instanceName' }),
      required: true,
    },
    { name: 'values' },
    {
      name: 'hzeroServiceId',
      required: true,
    },
    {
      name: 'hzeroServiceName',
      required: true,
    },
  ],
});
