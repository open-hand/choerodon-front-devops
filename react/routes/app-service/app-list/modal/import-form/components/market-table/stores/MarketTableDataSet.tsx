import { DataSetProps, Record, DataSet } from '@/interface';
import { countBy, some } from 'lodash';
import { SetCheckProps } from './index';

interface TableProps {
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  selectedDs: DataSet
  setAppChildren(record: Record): void,
  setVersionChildren(record: Record): void,
  handleMarketServiceCheck(data: SetCheckProps): void,
}

const setIndeterminate = (record: Record) => {
  record.set('indeterminate', false);
  record.get('childrenDataSet')?.forEach((eachRecord: Record) => {
    eachRecord.set('indeterminate', false);
  });
};

export default ({
  intlPrefix, formatMessage, selectedDs, setAppChildren,
  setVersionChildren, handleMarketServiceCheck,
}: TableProps): DataSetProps => ({
  autoQuery: true,
  pageSize: 10,
  expandField: 'expand',
  transport: {
    read: {
      url: 'market/v1/market/application/market_application_with_sourcecode/page',
      method: 'get',
    },
  },
  fields: [
    { name: 'name', label: formatMessage({ id: 'name' }) },
    { name: 'sourceProject', label: formatMessage({ id: `${intlPrefix}.source` }) },
    { name: 'lastUpdateDate', label: formatMessage({ id: 'updateDate' }) },
  ],
  events: {
    select: ({ record }: { record: Record }) => {
      // eslint-disable-next-line no-param-reassign
      record.isSelected = true;
      setAppChildren(record);
      record.get('childrenDataSet').selectAll();
      setIndeterminate(record);
    },
    unSelect: ({ record }: { record: Record }) => {
      // eslint-disable-next-line no-param-reassign
      record.isSelected = false;
      if (record.get('childrenDataSet')) {
        record.get('childrenDataSet').unSelectAll();
      }
      setIndeterminate(record);
    },
    selectAll: ({ dataSet }: { dataSet: DataSet }) => {
      dataSet.forEach((record: Record) => {
        setAppChildren(record);
        record.get('childrenDataSet').selectAll();
        setIndeterminate(record);
      });
    },
    unSelectAll: ({ dataSet }: { dataSet: DataSet }) => {
      dataSet.forEach((record: Record) => {
        if (record.get('childrenDataSet')) {
          record.get('childrenDataSet').unSelectAll();
        }
        setIndeterminate(record);
      });
    },
    load: ({ dataSet }: { dataSet: DataSet }) => {
      if (selectedDs.length) {
        const selectedData = selectedDs.toData();
        const appIdObject = countBy(selectedData, 'marketAppId');
        const appVersionIdObject = countBy(selectedData, 'marketAppVersionId');
        dataSet.forEach((record: Record) => {
          if (some(appIdObject, (value: string, key: string) => record.get('id') === key)) {
            setAppChildren(record);
            record.get('childrenDataSet')?.forEach((eachRecord: Record) => {
              if (some(appVersionIdObject, (value: string, key: string) => eachRecord.get('id') === key)) {
                setVersionChildren(eachRecord);
                eachRecord.get('childrenDataSet')?.forEach((childRecord: Record) => {
                  if (selectedDs.some((selectedRecord) => selectedRecord.get('id') === childRecord.get('id')
                    && selectedRecord.get('marketAppId') === record.get('id')
                    && selectedRecord.get('marketAppVersionId') === eachRecord.get('id'))
                  ) {
                    handleMarketServiceCheck({
                      checked: true,
                      childRecord,
                      childDs: eachRecord.get('childrenDataSet'),
                      parentDs: record.get('childrenDataSet'),
                      parentRecord: eachRecord,
                      record,
                    });
                  }
                });
              }
            });
          }
        });
      }
    },
  },
});
