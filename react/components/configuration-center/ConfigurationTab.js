// /* eslint-disable react-hooks/exhaustive-deps */
// // @ts-nocheck
// import React, { useState, useEffect } from 'react';
// import {
//   Form, TextField, Button, Tooltip, Select,
// } from 'choerodon-ui/pro';
// import { Input, message } from 'choerodon-ui';
// import { observer } from 'mobx-react-lite';
// import { every } from 'lodash';
// import styles from './index.less';

// export const queryConfigCodeOptions = (configCompareOptsDS, configurationCenterDataSet) => {
//   configurationCenterDataSet.forEach(async (record) => {
//     configCompareOptsDS.setQueryParameter('configGroup', record.get('configGroup'));
//     await configCompareOptsDS.query();
//     configurationCenterDataSet.getField('versionName').set('options', configCompareOptsDS);
//     if (configCompareOptsDS.length > 0) {
//       const { value: optValue } = configCompareOptsDS.get(0).toData();
//       record.set('versionName', optValue);
//     } else {
//       record.set('configCode', '');
//     }
//   });
// };

// const Content = observer((props) => {
//   const { configurationCenterDataSet, configCompareOptsDS } = props;
//   const [content, setContent] = useState('');
//   const configNameMap = new Map();

//   const optionRenderer = ({ text, value }) => {
//     configNameMap.set(value, text);
//     return text;
//   };

//   // 新建配置文件
//   const handleCreate = async () => {
//     configurationCenterDataSet.create({});
//   };

//   // 复制配置文件
//   const copyContent = async (record) => {
//     const configName = configNameMap.get(record.get('configCode'));
//     const text = `${record.get('mountPath')}${configName}`;
//     await setContent(text);
//     setTimeout(handleCopy(), 100);
//   };

//   const handleCopy = () => {
//     const input = document.querySelector('#copyTarget');
//     input.select();
//     if (document.execCommand('copy')) {
//       document.execCommand('copy');
//       message.success('复制成功');
//     } else {
//       message.error('复制失败');
//     }
//   };

//   const handleDelete = (record) => {
//     configurationCenterDataSet.delete(record, false);
//   };

//   return (
//     <div className={styles['c7ncd-configurationCenter']}>
//       {[
//         configurationCenterDataSet.map((record) => (
//           <Form record={record} columns={9} key={record.id}>
//             <TextField name="mountPath" label="挂载路径" colSpan={2} />
//             <Select name="configGroup" label="配置分组" noCache colSpan={2} />
//             <Select
//               name="configCode"
//               label="配置文件"
//               noCache
//               optionRenderer={optionRenderer}
//               colSpan={2}
//             />
//             <TextField name="versionName" label="配置文件版本" colSpan={2} disabled />
//             <div className={styles['c7ncd-action-link']}>
// <Tooltip title="点击后将复制由挂载路径和配置文件名称组合而成的路径，配置文件按照此路径存储于主机中。可以把复制的配置文件路径应用在前置操作、启动命令、以及后置操作等地方。">
//                 <Button
//                   onClick={() => copyContent(record)}
//                   funcType="flat"
//                   icon="content_copy"
//                   style={{ border: 'none', background: 'transparent' }}
//                   disabled={
//                     !every(
//                       [
//                         record.get('mountPath'),
//                         record.get('configGroup'),
//                         record.get('configCode'),
//                         record.get('versionName'),
//                       ],
//                       Boolean,
//                     )
//                   }
//                 />
//               </Tooltip>
//               <Button
//                 onClick={() => handleDelete(record)}
//                 funcType="flat"
//                 icon="delete_black-o"
//                 style={{ border: 'none', background: 'transparent' }}
//               />
//             </div>
//           </Form>
//         )),
//         <Button onClick={handleCreate} funcType="flat" icon="add">
//           添加配置文件
//         </Button>,
//       ]}

//       <Input
//         id="copyTarget"
//         value={content}
//         style={{ height: '0', position: 'relative', zIndex: -1 }}
//       />
//     </div>
//   );
// });

// export default Content;
