import { DataSetProps } from '@/interface';

interface TreeProps {
  projectId: number,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  data: string,
}

export default ({
  formatMessage, intlPrefix, data,
}: TreeProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  autoQueryAfterSubmit: false,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'command',
      label: formatMessage({ id: 'envPl.token' }),
      defaultValue: data,
    },
  ],
});
