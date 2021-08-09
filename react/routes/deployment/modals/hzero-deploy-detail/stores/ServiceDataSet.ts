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
    { name: 'value' },
  ],
});
