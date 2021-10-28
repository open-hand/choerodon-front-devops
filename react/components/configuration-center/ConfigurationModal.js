import React, { useMemo, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { EmptyPage } from '@choerodon/components';
import { isEmpty } from 'lodash';

import NoData from '@/routes/app-center-pro/assets/nodata.png';

const ConfigurationModal = observer((props) => {
  const { type, configurationCenterDataSet } = props;
  useEffect(() => {
    configurationCenterDataSet.query();
  }, []);
  const columns = useMemo(
    () => [
      {
        name: 'mountPath',
        editor: false,
      },
      {
        name: 'configGroup',
        editor: false,
      },
      {
        name: 'configCode',
        editor: false,
      },
    ],
    [],
  );

  return (
    <>
      {(!isEmpty(configurationCenterDataSet) || type === 'modal') && (
        <Table
          dataSet={configurationCenterDataSet}
          columns={columns}
          queryBar="none"
          pagination={false}
        />
      )}
      {isEmpty(configurationCenterDataSet) && type !== 'modal' && (
        <EmptyPage image={NoData} description={<>暂无配置文件详情</>} />
      )}
    </>
  );
});

export default ConfigurationModal;
