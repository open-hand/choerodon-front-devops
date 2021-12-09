/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: zhangqin <qin.zhang@hand-china.com>
 * @Date: 2021-10-26 10:28:36
 * @LastEditors: zhangqin <qin.zhang@hand-china.com>
 * @LastEditTime: 2021-12-08 11:41:07
 */
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useMemo, useEffect } from 'react';
// import { Table } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';
// import { EmptyPage } from '@choerodon/components';
// import { isEmpty, isNil } from 'lodash';

// import NoData from '@/routes/app-center-pro/assets/nodata.png';

// const ConfigurationModal = observer((props) => {
//   const {
//     type, configurationDetailDataSet, id, kind,
//   } = props;

//   useEffect(() => {
//     if (['host', 'hostDetail'].includes(kind)) {
//       if (!isNil(id)) {
//         configurationDetailDataSet.setQueryParameter('value', id);
//         configurationDetailDataSet.setQueryParameter('key', 'instance_id');
//         configurationDetailDataSet.query();
//       }
//     } else if (kind === 'deploy') {
//       configurationDetailDataSet.setQueryParameter('value', id);
//       configurationDetailDataSet.setQueryParameter('key', 'record_id');
//       configurationDetailDataSet.query();
//     }
//   }, [id]);

//   const columns = useMemo(
//     () => [
//       {
//         name: 'mountPath',
//         editor: false,
//       },
//       {
//         name: 'configGroup',
//         editor: false,
//       },
//       {
//         name: 'configCode',
//         editor: false,
//       },
//     ],
//     [],
//   );

//   return (
//     <>
//       {(!isEmpty(configurationDetailDataSet) || type === 'modal') && (
//         <Table
//           dataSet={configurationDetailDataSet}
//           columns={columns}
//           queryBar="none"
//           pagination={false}
//         />
//       )}
//       {isEmpty(configurationDetailDataSet) && type !== 'modal' && (
//         <EmptyPage image={NoData} description={<>暂无配置文件详情</>} />
//       )}
//     </>
//   );
// });

// export default ConfigurationModal;
