import { DataSetProps, Record, DataSet } from '@/interface';

export default (setVersionChildren: (record: Record) => void): DataSetProps => ({
  autoQuery: false,
  paging: false,
  expandField: 'expand',
  events: {
    select: ({ record }: { record: Record }) => {
      setVersionChildren(record);
      record.get('childrenDataSet').selectAll();
      record.set('indeterminate', false);
    },
    unSelect: ({ record }: { record: Record }) => {
      record.get('childrenDataSet')?.unSelectAll();
      record.set('indeterminate', false);
    },
    selectAll: ({ dataSet }: { dataSet: DataSet }) => {
      dataSet.forEach((record: Record) => {
        setVersionChildren(record);
        record.get('childrenDataSet').selectAll();
        record.set('indeterminate', false);
      });
    },
    unSelectAll: ({ dataSet }: { dataSet: DataSet }) => {
      dataSet.forEach((record: Record) => {
        if (record.get('childrenDataSet')) {
          record.get('childrenDataSet').unSelectAll();
          record.set('indeterminate', false);
        }
      });
    },
  },
});
