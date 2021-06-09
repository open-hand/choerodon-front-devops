import React, { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import {
  Select,
  Form,
  SelectBox,
  TextField,
  Button,
  Table,
  Tooltip,
  message,
  Password,
  NumberField,
  DataSet,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import StatusDot from '@/components/status-dot';
import BaseComDeployServices from '@/routes/deployment/modals/base-comDeploy/services';
import Tips from '@/components/new-tips';
import { NewTips } from '@choerodon/components';
import ResourceSetting from './components/resource-setting';
import {
  mapping,
  deployWayOptionsData,
  deployModeOptionsData,
  middleWareData,
  mapping as baseMapping,
  mySqlDeployModeOptionsData,
} from './stores/baseDeployDataSet';
import { mapping as hostMapping } from './stores/hostSettingDataSet';
import paramSettingDataSet, { mapping as paramsMapping, mapping as paramMapping } from './stores/paramSettingDataSet';
import { useBaseComDeployStore } from './stores';
import redis from './images/redis.png';
import mysql from './images/mysql.png';

import './index.less';

const { Option } = Select;
const { Column } = Table;

export default observer(() => {
  const {
    BaseDeployDataSet,
    HostSettingDataSet,
    ParamSettingDataSet,
    PVLabelsDataSet,
    modal,
    AppState: { currentMenuType: { projectId } },
    refresh,
    deployWay,
    middlewareData,
    ServiceVersionDataSet,
    BaseComDeployStore,
  } = useBaseComDeployStore();

  modal.handleOk(async () => {
    const middleWare = BaseDeployDataSet.current.get(mapping.middleware.name);
    let pass;
    let axiosData = {};
    let flag = false;
    function setFlagBaseOnParamsSetting(f, ad = {}, isHostInside = false) {
      let resultData = ad;
      function setFlag(ds) {
        for (let i = 0; i < ds.records.length; i += 1) {
          const result = handleValidParamsRunningValue(ds
            .records[i].get(paramMapping.paramsRunnigValue.name), ds.records[i]);
          if (result !== true) {
            // eslint-disable-next-line no-param-reassign
            f = true;
            break;
          }
        }
      }
      // if param's setting is outside of item of hosts
      if (!isHostInside) {
        setFlag(ParamSettingDataSet);
      } else {
        // inside
        for (let i = 0; i < HostSettingDataSet.records.length; i += 1) {
          const ds = HostSettingDataSet.records[i].getState('params');
          setFlag(ds);
        }
      }
      if (!f) {
        const configuration = {};
        if (!isHostInside) {
          ParamSettingDataSet.records.forEach((i) => {
            configuration[i.get(paramMapping.params.name)] = i
              .get(paramMapping.paramsRunnigValue.name);
          });
          // eslint-disable-next-line no-param-reassign
          resultData = {
            ...resultData,
            configuration,
          };
        } else {
          HostSettingDataSet.records.forEach((i) => {
            const item = {};
            i.getState('params').forEach((j) => {
              item[j.get(paramMapping.params.name)] = j
                .get(paramMapping.paramsRunnigValue.name);
            });
            configuration[i.get(hostMapping.hostId.name)] = item;
          });
          resultData = configuration;
        }
      }
      return { f, resultData };
    }
    // redis
    if (middleWare === middleWareData[0].value) {
      // 环境部署
      if (BaseDeployDataSet.current.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
        // const devopsServiceReqVO = await networkRef.current.getDevopsServiceReqVO();
        // const devopsIngressVO = await domainRef.current.getDevopsIngressVO();
        // let resource;
        // if (devopsServiceReqVO && devopsIngressVO) {
        //   if (!devopsServiceReqVO?.devopsServiceReqVO?.name) {
        //     devopsServiceReqVO.devopsServiceReqVO = null;
        //   }
        //   if (!devopsIngressVO?.devopsIngressVO?.name) {
        //     devopsIngressVO.devopsIngressVO = null;
        //   }
        //   resource = {
        //     ...devopsServiceReqVO,
        //     ...devopsIngressVO,
        //   };
        // } else {
        //   return false;
        // }
        // axiosData = {
        //   ...resource,
        // };
        axiosData = {
          [mapping.serviceVersion.name]: BaseDeployDataSet
            .toData()[0][mapping.serviceVersion.name],
          [mapping.deployWay.name]: BaseDeployDataSet
            .toData()[0][mapping.deployWay.name],
          [mapping.deployMode.name]: BaseDeployDataSet
            .toData()[0][mapping.deployMode.name],
          [mapping.env.name]: BaseDeployDataSet
            .toData()[0][mapping.env.name],
          [mapping.instance.name]: BaseDeployDataSet
            .toData()[0][mapping.instance.name],
          [mapping.password.name]: BaseDeployDataSet
            .toData()[0][mapping.password.name],
          [mapping.sysctlImage.name]: BaseDeployDataSet
            .toData()[0][mapping.sysctlImage.name],
          type: 'create',
          isNotChange: false,
        };
        // 如果是哨兵
        if (BaseDeployDataSet.current.get(mapping.deployMode.name)
          === deployModeOptionsData[1].value) {
          // flag = !await PVLabelsDataSet.validate();
          // if (!flag) {
          //   const pvLength = PVLabelsDataSet.records.filter((i) => !i.isRemoved).length;
          //   const slaveCount = BaseDeployDataSet.current.get(mapping.slaveCount.name);
          //   if (!(pvLength && pvLength >= slaveCount)) {
          //     flag = true;
          //     message.error('pv标签数量应大于等于slaveCount的数量');
          //   }
          // }
          const pvlabels = {};
          for (let i = 0; i < PVLabelsDataSet.records.length; i += 1) {
            // 如果都没有
            if (!PVLabelsDataSet.records[i].get('key') && !PVLabelsDataSet.records[i].get('value')) {
              // message.error('pv标签应配对填写');
              // flag = true;
              // break;
            } else if (PVLabelsDataSet.records[i].get('key') && PVLabelsDataSet.records[i].get('value')) {
              //   如果都有
              if (Object.keys(pvlabels).includes(PVLabelsDataSet.records[i].get('key'))) {
                flag = true;
                message.error('pv标签键值应唯一');
                break;
              } else {
                pvlabels[PVLabelsDataSet.records[i].get('key')] = PVLabelsDataSet.records[i].get('value');
              }
            } else {
              message.error('pv标签应配对填写');
              flag = true;
              break;
            }
          }
          axiosData[mapping.slaveCount.name] = BaseDeployDataSet
            .toData()[0][mapping.slaveCount.name];
          axiosData.pvLabels = pvlabels;
        } else {
        //  如果是单机
          axiosData[mapping.pvc.name] = BaseDeployDataSet
            .toData()[0][mapping.pvc.name];
        }
        pass = await BaseDeployDataSet.validate();
        // 如果通过校验
        if (pass && !flag) {
          // axiosData = {
          //   [mapping.serviceVersion.name]: BaseDeployDataSet
          //     .toData()[0][mapping.serviceVersion.name],
          //   [mapping.deployMode.name]: BaseDeployDataSet
          //     .toData()[0][mapping.deployMode.name],
          //   [mapping.env.name]: BaseDeployDataSet
          //     .toData()[0][mapping.env.name],
          //   [mapping.instance.name]: BaseDeployDataSet
          //     .toData()[0][mapping.instance.name],
          //   [mapping.values.name]: BaseDeployDataSet
          //     .toData()[0][mapping.values.name],
          //   type: 'create',
          //   isNotChange: false,
          // };
        } else {
          return false;
        }
      } else {
      //  主机部署
        const baseValid = await BaseDeployDataSet.validate();
        const hostValid = await HostSettingDataSet.validate();
        if (baseValid && hostValid) {
          if (HostSettingDataSet.records.some((i) => !i.get(hostMapping.status.name) || i.get(hostMapping.status.name) !== 'success')) {
            const result = await handleTestConnect();
            if (!result) {
              return false;
            }
          }
          if (!flag) {
            axiosData = {
              hostIds: HostSettingDataSet.records.map((i) => i.get(hostMapping.hostId.name)),
              [mapping.deployMode.name]: BaseDeployDataSet.current.get(mapping.deployMode.name),
              name: BaseDeployDataSet.current.get(mapping.resourceName.name),
              [mapping.serviceVersion.name]: BaseDeployDataSet
                .current.get(mapping.serviceVersion.name),
              [mapping.password.name]: BaseDeployDataSet.current.get(mapping.password.name),
              type: 'create',
              isNotChange: false,
            };
          }
        } else {
          return false;
        }
      }
      const result = setFlagBaseOnParamsSetting(flag, axiosData);
      flag = result.f;
      axiosData = result.resultData;
      if (!flag) {
        try {
          if (BaseDeployDataSet
            .current.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
            await BaseComDeployServices.axiosPostDeployMiddleware(projectId, axiosData);
          } else {
            await BaseComDeployServices.axiosPostDeployHost(projectId, axiosData);
          }
          BaseDeployDataSet.reset();
          refresh();
          return true;
        } catch (e) {
          return false;
        }
      }
    } else {
      //  mysql
      const record = BaseDeployDataSet.current;
      // 容器部署
      if (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
        const flagBase = await BaseDeployDataSet.validate();
        let flagParams = false;
        const result = setFlagBaseOnParamsSetting(flagParams, axiosData);
        flagParams = result.f;
        axiosData = result.resultData;
        if (flagBase && !flagParams) {
          axiosData = {
            ...axiosData,
            [mapping.serviceVersion.name]: BaseDeployDataSet
              .toData()[0][mapping.serviceVersion.name],
            [mapping.deployWay.name]: BaseDeployDataSet
              .toData()[0][mapping.deployWay.name],
            [mapping.env.name]: BaseDeployDataSet
              .toData()[0][mapping.env.name],
            [mapping.instance.name]: BaseDeployDataSet
              .toData()[0][mapping.instance.name],
            [mapping.password.name]: BaseDeployDataSet
              .toData()[0][mapping.password.name],
            [mapping.pvc.name]: BaseDeployDataSet
              .toData()[0][mapping.pvc.name],
          };
          try {
            await BaseComDeployServices.axiosPostBaseDeployMySqlEnvApi(projectId, axiosData);
            BaseDeployDataSet.reset();
            refresh();
            return true;
          } catch (e) {
            return false;
          }
        }
      } else {
        // 主机部署
        const baseValid = await BaseDeployDataSet.validate();
        const hostValid = await HostSettingDataSet.validate();
        if (baseValid && hostValid) {
          // if exist un-connect host
          if (HostSettingDataSet.records.filter((i) => !i.isRemoved).some((i) => !i.get('status'))) {
            const testResult = await handleTestConnect();
            if (!testResult) {
              return false;
            }
          }
          const result = setFlagBaseOnParamsSetting(flag, {}, true);
          if (!result.f) {
            axiosData = {
              [mapping.serviceVersion.name]: BaseDeployDataSet
                .toData()[0][mapping.serviceVersion.name],
              [mapping.deployWay.name]: BaseDeployDataSet
                .toData()[0][mapping.deployWay.name],
              [mapping.deployMode.name]: BaseDeployDataSet.current.get(mapping.deployMode.name),
              [mapping.env.name]: BaseDeployDataSet
                .toData()[0][mapping.env.name],
              [mapping.password.name]: BaseDeployDataSet
                .toData()[0][mapping.password.name],
              [mapping.virtualIp.name]: BaseDeployDataSet
                .toData()[0][mapping.virtualIp.name],
              hostIds: HostSettingDataSet.records.map((i) => i.get(hostMapping.hostId.name)),
              configuration: result.resultData,
              name: BaseDeployDataSet.current.get(mapping.resourceName.name),
            };
            try {
              await BaseComDeployServices.axiosPostBaseDeployMySqlHostApi(projectId, axiosData);
              BaseDeployDataSet.reset();
              refresh();
              return true;
            } catch (e) {
              return false;
            }
          }
        }
      }
    }
    return false;
  });

  /**
   * 初始化服务版本options
   */
  const getServiceVersionAndSetInit = (name) => {
    BaseComDeployServices.axiosGetServiceVersion(name).then((res) => {
      ServiceVersionDataSet.loadData(res);
      BaseDeployDataSet.current.set(mapping.serviceVersion.name, res[0].versionNumber);
    });
  };

  useEffect(() => {
    init();
    async function init() {
      // 初始化为哨兵模式 初始化三个record
      HostSettingDataSet.create();
      HostSettingDataSet.create();
      if (deployWay) {
        BaseDeployDataSet.current.set(mapping.deployWay.name, deployWay);
      }
      if (middlewareData) {
        BaseDeployDataSet.current.set(mapping.middleware.name, middlewareData);
      }
      // 初始化查询mysql 主机的table params
      const result = await BaseComDeployServices.axiosGetParamsSetting('MySQL', 'host', 'master-slave');
      result.middlewareConfigVOS.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.paramsRunningValue = item.paramDefaultValue;
      });
      BaseComDeployStore.setMysqlParams(result.middlewareConfigVOS);
      BaseDeployDataSet
        .current.getField(mapping.deployMode.name).options.loadData(deployModeOptionsData);
      BaseDeployDataSet.current.set(mapping.deployMode.name, deployModeOptionsData[1].value);
    }
  }, []);

  useEffect(() => {
    getServiceVersionAndSetInit(BaseDeployDataSet.current.get(mapping.middleware.name));
  }, [BaseDeployDataSet.current.get(mapping.middleware.name)]);

  useEffect(() => {
    const middleware = BaseDeployDataSet.current.get(mapping.middleware.name);
    const deployWary = BaseDeployDataSet.current.get(mapping.deployWay.name);
    const deployMode = BaseDeployDataSet.current.get(mapping.deployMode.name);
    HostSettingDataSet.getField(hostMapping.hostName.name).set('required', (deployWary === deployWayOptionsData[1].value));

    // 如果不是mysql + 主机部署 则要重查paramsetting
    if (!(middleware === middleWareData[1].value && deployWary === deployWayOptionsData[1].value)) {
      // 中间件 部署方式 部署模式改变 重新查询table数据
      ParamSettingDataSet.setQueryParameter('queryParams', {
        middleware: BaseDeployDataSet.current.get(baseMapping.middleware.name),
        deployWay: BaseDeployDataSet.current.get(baseMapping.deployWay.name),
        deployMode: BaseDeployDataSet.current.get(baseMapping.deployMode.name),
      });
      ParamSettingDataSet.query();
    }
    // 根据选择部署方式不同 修改ip和端口的label字段
    if (middleware === middleWareData[0].value
      && deployWary === deployWayOptionsData[1].value
      && deployMode === deployModeOptionsData[0].value
    ) {
      HostSettingDataSet.getField(hostMapping.ip.name).set('label', 'ip');
      HostSettingDataSet.getField(hostMapping.port.name).set('label', '端口');
      HostSettingDataSet.getField(hostMapping.privateIp.name).set('label', '内部IP');
      HostSettingDataSet.getField(hostMapping.privatePort.name).set('label', '内部端口');
    } else {
      HostSettingDataSet.getField(hostMapping.ip.name).set('label', '外部SSH认证IP');
      HostSettingDataSet.getField(hostMapping.port.name).set('label', '外部SSH认证端口');
      HostSettingDataSet.getField(hostMapping.privateIp.name).set('label', '内部SSH认证IP');
      HostSettingDataSet.getField(hostMapping.privatePort.name).set('label', '内部SSH认证端口');
    }
  }, [
    BaseDeployDataSet.current.get(mapping.middleware.name),
    BaseDeployDataSet.current.get(mapping.deployWay.name),
    BaseDeployDataSet.current.get(mapping.deployMode.name),
  ]);

  useEffect(() => {
    // 主机模式 部署模式改变 清空主机设置
    if (BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[0].value) {
      if (BaseDeployDataSet.current.get(mapping.deployWay.name) === deployWayOptionsData[1].value) {
        HostSettingDataSet.records.forEach((item) => {
          Object.keys(hostMapping).forEach((key) => {
            item.init(key);
          });
        });
      }
    }
  }, [BaseDeployDataSet.current.get(mapping.deployMode.name)]);

  /**
   * 获取主机名称disabled属性
   */
  const getHostNameDisabled = (data) => {
    if (HostSettingDataSet.records.find((i) => i.get(hostMapping.hostName.name) === data.record.get('id'))) {
      return true;
    } if ([deployModeOptionsData[1].value,
      mySqlDeployModeOptionsData[1].value].includes(BaseDeployDataSet
      .current
      .get(mapping.deployMode.name))) {
      //  如果是哨兵模式
      if (data.record.get('privateIp')) {
        return false;
      }
      return true;
    }
    return false;
  };

  /**
   * 点击mysql 下单个主机事件
   */
  const handleClickItemHost = ({ record, ds }) => {
    if (!record.get(hostMapping.checked.name)) {
      ds.records.forEach((i) => {
        if (i.id === record.id) {
          i.set(hostMapping.checked.name, true);
        } else {
          i.set(hostMapping.checked.name, false);
        }
      });
    }
  };

  /**
   * 添加主机
   */
  const handleAddHost = () => {
    HostSettingDataSet.create();
  };

  /**
   * 添加主机按钮的disabled属性
   */
  const addHostDisabled = () => {
    const deployMode = BaseDeployDataSet.current.get(mapping.deployMode.name);
    const single = deployModeOptionsData[0].value;
    const multiple = deployModeOptionsData[1].value;
    const { length } = HostSettingDataSet.records;
    if (deployMode === single) {
      if (length === 1) {
        return true;
      }
      return false;
    }
    return false;
  };

  /**
   * 环境option渲染
   * @param envRecord
   * @param text
   * @param value
   * @returns {*}
   */
  function renderEnvOption({ record: envRecord, text, value }) {
    return (
      <>
        {value && (
          <StatusDot
            connect={envRecord.get('connect')}
            synchronize={envRecord.get('synchro')}
            active={envRecord.get('active')}
            size="small"
          />
        )}
        <span>{text}</span>
      </>
    );
  }

  /**
   * 环境option属性
   * @param envRecord
   * @returns {{disabled: boolean}}
   */
  function renderOptionProperty({ record: envRecord }) {
    const isAvailable = envRecord.get('connect') && envRecord.get('synchro') && envRecord.get('permission');
    return ({
      disabled: !isAvailable,
    });
  }

  /**
   * 渲染主机部署右侧dom
   */
  const renderHostDeployRight = () => {
    const record = BaseDeployDataSet.current;
    // redis
    if (record.get(mapping.middleware.name) === middleWareData[0].name) {
      return [
        <TextField style={{ visibility: 'hidden' }} colSpan={1} />,
        <SelectBox
          colSpan={1}
          name={mapping.deployMode.name}
        />,
        <TextField newLine colSpan={1} name={mapping.resourceName.name} />,
      ];
    }
    //  mysql
    return [
      <SelectBox
        colSpan={1}
        name={mapping.deployMode.name}
      />,
      <TextField colSpan={1} name={mapping.resourceName.name} />,
    ];
  };

  const renderDomBaseOnDeployWay = useMemo(() => (
    BaseDeployDataSet.current
      .get(mapping.deployWay.name) === deployWayOptionsData[1].value ? renderHostDeployRight() : [
        BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[0].value ? <SelectBox colSpan={1} name={mapping.deployMode.name} /> : '',
        <Select
          newLine
          colSpan={1}
          name={mapping.env.name}
          optionRenderer={renderEnvOption}
          onOption={renderOptionProperty}
        />,
        <TextField colSpan={1} name={mapping.instance.name} />,
        // <Select
        //   combo
        //   name={mapping.pvc.name}
        //   colSpan={1}
        // />,
      ]
  ), [BaseDeployDataSet.current
    .get(mapping.deployWay.name), BaseDeployDataSet.current.get(mapping.middleware.name)]);

  /**
   * 删除host
   */
  const handleDeleteHost = (record) => {
    HostSettingDataSet.remove(record);
    // console.log(HostSettingDataSet);
  };

  /**
   * 测试连接
   */
  const handleTestConnect = async (id) => {
    // 单个
    if (id) {
      const result = await BaseComDeployServices.axiosPostTestHost(projectId, [id]);
      if (result) {
        const record = HostSettingDataSet
          .records.find((i) => i.get(hostMapping.hostName.name) === id);
        if (result.includes(record.get(hostMapping.hostId.name))) {
          record.set(hostMapping.status.name, 'failed');
        } else {
          record.set(hostMapping.status.name, 'success');
        }
        if (!result || result.length === 0) {
          return true;
        }
      }
      return false;
    }
    // 全部测试
    const valid = await HostSettingDataSet.validate();
    if (valid) {
      const ids = HostSettingDataSet
        .records
        .filter(
          (i) => i.get(hostMapping.hostName.name),
        ).map((i) => i.get(hostMapping.hostName.name));
      const result = await BaseComDeployServices.axiosPostTestHost(projectId, ids);
      if (result) {
        HostSettingDataSet.records.forEach((record) => {
          if (result.includes(record.get(hostMapping.hostId.name))) {
            record.set(hostMapping.status.name, 'failed');
          } else {
            record.set(hostMapping.status.name, 'success');
          }
        });
        if (!result || result.length === 0) {
          return true;
        }
      }
      return false;
    }
    return false;
  };

  const renderItemHostStatus = (record) => {
    if (record && record.get) {
      switch (record?.get(hostMapping.status.name)) {
        case 'success': {
          return (
            <span
              className="c7ncd-baseDeploy-middle-deploySetting-status"
              style={{
                color: '#1FC2BB',
              }}
            >
              <Icon
                type="check"
                style={{
                  background: 'rgb(31, 194, 187)',
                  color: 'white',
                }}
              />
              成功
            </span>
          );
          break;
        }
        case 'failed': {
          return (
            <span
              className="c7ncd-baseDeploy-middle-deploySetting-status"
              style={{
                color: '#f76776',
              }}
            >
              <Icon
                type="close"
                style={{
                  background: '#F76776',
                  color: 'white',
                }}
              />
              失败
            </span>
          );
        }
        default:
          return '';
          break;
      }
    }
    return '';
  };

  /**
   * 默认值渲染
   * @param value
   * @returns {*}
   */
  const renderParamsScope = ({ value }) => (
    <Tooltip title={value}>
      {value}
    </Tooltip>
  );

  /**
   * 参数运行值 render
   * @param value
   * @param record
   */
  const renderParamsRunningValue = ({ value, record }) => (
    <TextField
      required
      value={value}
      onChange={(text) => record.set(paramMapping.paramsRunnigValue.name, text)}
      validator={(values) => handleValidParamsRunningValue(values, record)}
    />
  );

  /**
   * table操作列
   */
  const renderOperation = ({ record, isHostInside = true }) => !record.get('id') && (
    <Button
      funcType="flat"
      onClick={() => {
        if (isHostInside) {
          const ds = HostSettingDataSet
            .records.find((i) => i.get(hostMapping.checked.name)).getState('params');
          ds.remove(record);
          HostSettingDataSet
            .records.find((i) => i.get(hostMapping.checked.name)).setState('params', ds);
        } else {
          ParamSettingDataSet.remove(record);
        }
      }}
      icon="delete"
    />
  );

  /**
   * table 参数render
   * @param value
   * @param record
   * @returns {*}
   */
  const renderParams = ({ value, record, name }) => (record.get('custom') ? (
    <TextField
      value={value}
      onChange={(v) => record.set(name, v)}
    />
  ) : (
    <span>
      {value}
      {
        record.get(paramMapping.tooltip.name) && (
          <NewTips
            helpText={record.get(paramMapping.tooltip.name)}
            style={{
              position: 'relative',
              bottom: 1,
            }}
          />
        )
      }
    </span>
  ));

  /**
   * 测试连接整个结果渲染
   */
  const renderHostResult = () => {
    if (HostSettingDataSet.records.some((i) => i.get(hostMapping.status.name))) {
      if (HostSettingDataSet.records.some((i) => i.get(hostMapping.status.name) === 'failed')) {
        return (
          <div className="c7ncd-baseDeploy-middle-testButton-result c7ncd-baseDeploy-middle-failed">
            <span>测试连接:</span>
            <span>
              <Icon type="close" />
              失败
            </span>
          </div>
        );
      }
      return (
        <div className="c7ncd-baseDeploy-middle-testButton-result c7ncd-baseDeploy-middle-success">
          <span>测试连接:</span>
          <span>
            <Icon type="check" />
            成功
          </span>
        </div>
      );
    }
    return '';
  };

  const handleValidParamsRunningValue = (values, record) => {
    if (!values) {
      message.error('请输入参数');
      return '该字段为必填';
    }
    const itemScope = record.get(paramMapping.paramsScope.name);
    let middleValue;
    if (itemScope.includes('~') || itemScope.includes('～')) {
      if (itemScope.includes('~')) { middleValue = '~'; }
      if (itemScope.includes('～')) { middleValue = '～'; }
      //  为区间
      if (parseFloat(values).toString() === 'NaN') {
        message.error('请输入数字');
        return '请输入数字';
      }
      const scope = itemScope.split(middleValue);
      const newValues = values.replace(/,/gi, '');
      if (newValues <= parseFloat(scope[1].replace(/,/gi, ''))
        && newValues >= parseFloat(scope[0].replace(/,/gi, ''))) {
        return true;
      }
      message.error('超出区间范围');
      return '超出区间范围';
    } if (itemScope.includes(',')) {
      //  select取值
      if (itemScope.split(',').includes(values)) {
        return true;
      }
      message.error('超出区间范围');
      return '超出区间范围';
    }
    return true;
  };

  /**
   * 主机部署的主机设置部分
   */
  const rennderHostDeployCotent = () => {
    const recordd = BaseDeployDataSet.current;
    // redis
    if (recordd.get(mapping.middleware.name) === middleWareData[0].value) {
      return (
        <>
          <p className="c7ncd-baseDeploy-middle-deploySetting">
            主机设置
            <Icon type="expand_less" />
          </p>
          {
            HostSettingDataSet.records.filter((i) => !i.isRemoved).map((record) => (
              <div style={{ position: 'relative', width: '80%' }}>
                <Form
                  columns={
                    BaseDeployDataSet
                      .current
                      .get(mapping.deployMode.name) === deployModeOptionsData[0].value ? 3 : 5
                  }
                  style={{ width: '100%' }}
                  record={record}
                >
                  <Select
                    colSpan={1}
                    name={hostMapping.hostName.name}
                    onOption={(data) => ({
                      disabled: getHostNameDisabled(data),
                    })}
                  />
                  <TextField colSpan={1} name={hostMapping.ip.name} />
                  <TextField colSpan={1} name={hostMapping.port.name} />
                  {
                    BaseDeployDataSet
                      .current
                      .get(mapping.deployMode.name) === deployModeOptionsData[1].value && [
                        <TextField colSpan={1} name={hostMapping.privateIp.name} />,
                        <TextField colSpan={1} name={hostMapping.privatePort.name} />,
                    ]
                  }

                </Form>
                <Button
                  funcType="flat"
                  disabled={deleteHostDisabled(BaseDeployDataSet, HostSettingDataSet)}
                  icon="delete"
                  style={{
                    position: 'absolute',
                    right: '-36px',
                    bottom: '30px',
                  }}
                  onClick={() => handleDeleteHost(record)}
                />
                {renderItemHostStatus(record)}
              </div>
            ))
          }
          <Button
            icon="add"
            color="primary"
            funcType="flat"
            className="c7ncd-baseDeploy-middle-flexButton"
            disabled={addHostDisabled()}
            onClick={handleAddHost}
          >
            添加主机
          </Button>
          <div
            className="c7ncd-baseDeploy-middle-testButton"
          >
            <Button
              funcType="flat"
              disabled={HostSettingDataSet
                .records.filter((i) => !i.isRemoved)
                .every((i) => !i.get(hostMapping.hostName.name))}
              onClick={() => handleTestConnect()}
            >
              测试连接
            </Button>
            {
              renderHostResult()
            }

          </div>
          <p style={{ marginTop: 30 }} className="c7ncd-baseDeploy-middle-deploySetting">
            参数配置
            <Icon type="expand_less" />
          </p>
          <Form columns={3} style={{ width: '80%', marginTop: 16 }} dataSet={BaseDeployDataSet}>
            <Password autoComplete="new-password" colSpan={1} name={mapping.password.name} />
          </Form>
        </>
      );
    }
    // mysql
    return (
      <>
        <p className="c7ncd-baseDeploy-middle-deploySetting">
          主机设置
          <NewTips
            helpText="配置部署MySQL服务的主机信息以及MySQL的运行时配置。"
            style={{
              marginLeft: 5,
              position: 'relative',
              bottom: 2,
            }}
          />
          <Icon type="expand_less" />
        </p>
        <Form dataSet={BaseDeployDataSet} columns={3}>
          <Password
            autoComplete="new-password"
            colSpan={1}
            name={mapping.password.name}
            addonAfter={<Tips helpText="默认密码为Changeit!123。修改密码需满足以下要求：1、长度最短8位 2、至少包含一个数字 3、至少包含一个大写字母 4、至少包含一个小写字母 5、至少包含一个特殊符号" />}
          />
          {
            BaseDeployDataSet
              .current
              .get(mapping.deployMode.name) === mySqlDeployModeOptionsData[1].value
            && (
              <TextField
                colSpan={1}
                name={mapping.virtualIp.name}
                addonAfter={<Tips helpText="对外提供MySQL服务的ip地址" />}
              />
            )
          }
        </Form>
        <div className="c7ncd-baseDeploy-middle-hostList">
          <div className="c7ncd-baseDeploy-middle-hostList-left">
            {
                HostSettingDataSet.records.filter((i) => !i.isRemoved).map((i) => (
                  <Form record={i}>
                    <div
                      role="none"
                      style={{
                        cursor: 'pointer',
                        padding: '10px 10px 10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        borderTop: i.get(hostMapping.checked.name) ? '2px solid rgba(0, 0, 0, 0.12)' : 'unset',
                        borderBottom: i.get(hostMapping.checked.name) ? '2px solid rgba(0, 0, 0, 0.12)' : 'unset',
                        position: 'relative',
                        bottom: '1px',
                      }}
                      onClick={() => handleClickItemHost({ record: i, ds: HostSettingDataSet })}
                    >
                      <div
                        className="c7ncd-baseDeploy-middle-hostList-left-checkedLine"
                        style={{
                          visibility: i.get(hostMapping.checked.name) ? 'visible' : 'hidden',
                        }}
                      />
                      <div
                        className="c7ncd-baseDeploy-middle-hostList-left-whiteline"
                        style={{
                          visibility: i.get(hostMapping.checked.name) ? 'visible' : 'hidden',
                        }}
                      />
                      <Select
                        onClick={(e) => e.stopPropagation()}
                        name={hostMapping.hostName.name}
                        onOption={(data) => ({
                          disabled: getHostNameDisabled(data),
                        })}
                      />
                      {/* <Button */}
                      {/*  style={{ flexShrink: 0, margin: '0 5px' }} */}
                      {/*  icon="delete" */}
                      {/*  disabled={deleteHostDisabled(BaseDeployDataSet, HostSettingDataSet)} */}
                      {/*  onClick={(e) => { */}
                      {/*    e.stopPropagation(); */}
                      {/*    handleDeleteHost(i); */}
                      {/*  }} */}
                      {/* /> */}
                    </div>
                  </Form>
                ))
            }
            {/* <Button */}
            {/*  icon="add" */}
            {/*  color="primary" */}
            {/*  className="c7ncd-baseDeploy-middle-flexButton" */}
            {/*  disabled={addHostDisabled()} */}
            {/*  onClick={() => { */}
            {/*    HostSettingDataSet.create(); */}
            {/*    HostSettingDataSet.records[HostSettingDataSet
            .records.length - 1].setState('params', new DataSet({ */}
            {/*      paging: false, */}
            {/*      selection: false, */}
            {/*      data: BaseComDeployStore.getMysqlParams, */}
            {/*      fields: Object.keys(paramsMapping).map((key) => paramsMapping[key]), */}
            {/*    })); */}
            {/*  }} */}
            {/* > */}
            {/*  添加主机 */}
            {/* </Button> */}
          </div>
          <div className="c7ncd-baseDeploy-middle-hostList-right">
            <Form
              columns={5}
              record={HostSettingDataSet.records.find((i) => i.get(hostMapping.checked.name))}
              style={{
                position: 'relative',
              }}
            >
              <TextField colSpan={1} name={hostMapping.ip.name} />
              <TextField colSpan={1} name={hostMapping.port.name} />
              <TextField colSpan={1} name={hostMapping.privateIp.name} />
              <TextField colSpan={1} name={hostMapping.privatePort.name} />
              {renderItemHostStatus(HostSettingDataSet
                .records.find((i) => i.get(hostMapping.checked.name)))}
            </Form>
            <div
              className="c7ncd-baseDeploy-middle-testButton"
              style={{
                marginTop: 'unset',
              }}
            >
              <Button
                funcType="flat"
                color="blue"
                disabled={!HostSettingDataSet
                  .records.find((i) => i
                    .get(hostMapping.checked.name)).get(hostMapping.hostName.name)}
                onClick={() => handleTestConnect(HostSettingDataSet
                  .records.find((i) => i
                    .get(hostMapping.checked.name)).get(hostMapping.hostName.name))}
              >
                测试连接
              </Button>
            </div>
            <Button
              icon="add"
              color="primary"
              style={{
                position: 'relative',
                left: 'calc(100% - 100px)',
              }}
              onClick={() => handleAddParams(true)}
            >
              添加参数
            </Button>
            <Table
              editMode="inline"
              style={{ marginTop: 20 }}
              queryBar="none"
              dataSet={HostSettingDataSet
                .records.find((i) => i.get(hostMapping.checked.name)).getState('params')}
              rowHeight={60}
            >
              <Column header="参数" name={paramMapping.params.name} renderer={renderParams} />
              <Column header="参数默认值" name={paramMapping.defaultParams.name} />
              <Column header="参数范围" name={paramMapping.paramsScope.name} renderer={renderParamsScope} />
              <Column
                name={paramMapping.paramsRunnigValue.name}
                renderer={renderParamsRunningValue}
                header="参数运行值"
              />
              <Column
                width={60}
                renderer={({ record }) => renderOperation({ record, isHostInside: true })}
              />
            </Table>
          </div>
        </div>
      </>
    );
  };

  const renderBottomDomBaseOnDeployWay = () => (
    BaseDeployDataSet
      .current
      .get(mapping.deployWay.name) === deployWayOptionsData[1].value
      ? rennderHostDeployCotent() : [
        <p className="c7ncd-baseDeploy-middle-deploySetting">
          参数配置
          <Icon type="expand_less" />
        </p>,
        <Form columns={3} style={{ width: '80%', marginTop: 16 }} dataSet={BaseDeployDataSet}>
          {
          BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[1].value ? [
            <Password
              autoComplete="new-password"
              colSpan={1}
              name={mapping.password.name}
              addonAfter={<Tips helpText="访问MySQL服务的密码" />}
            />,
            <Select
              combo
              colSpan={1}
              name={mapping.pvc.name}
              addonAfter={<Tips helpText="此项填值，redis将使用对应的PVC进行数据持久化" />}
            />,
          ] : [
            <Password
              autoComplete="new-password"
              colSpan={1}
              name={mapping.password.name}
              addonAfter={<Tips helpText="访问redis服务的密码" />}
            />,
            <Select
              colSpan={1}
              name={mapping.sysctlImage.name}
              addonAfter={<Tips helpText="此处指：是否启用内核参数优化。比如优化redis连接数、内存使用等等。" />}
            >
              <Option value>true</Option>
              <Option value={false}>false</Option>
            </Select>,
            BaseDeployDataSet.current
              .get(mapping.deployMode.name) === deployModeOptionsData[0].value ? (
                <Select
                  combo
                  colSpan={1}
                  name={mapping.pvc.name}
                  addonAfter={<Tips helpText="此项填值，redis将使用对应的PVC进行数据持久化" />}
                />
              ) : (
                <NumberField
                  colSpan={1}
                  name={mapping.slaveCount.name}
                  addonAfter={<Tips helpText="哨兵节点数量。最小是3" />}
                />
              ),
          ]
        }
        </Form>,
        (BaseDeployDataSet.current
          .get(mapping.deployMode.name) === deployModeOptionsData[0].value) || (
          BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[1].value
        ) ? '' : [
          <p className="c7ncd-baseDeploy-middle-deploySetting">
            PV标签
            <Icon type="expand_less" />
            <Tooltip title="此处输入的PV标签用于定位对应的PV，此处需保证匹配得到的PV数量应大于等于slaveCount的数量">
              <Icon
                style={{
                  color: 'rgba(15, 19, 88, 0.35)',
                  fontSize: '16px',
                }}
                type="help"
              />
            </Tooltip>
          </p>,
          PVLabelsDataSet.records.filter((item) => !item.isRemoved).map((item) => (
            <>
              <Form style={{ width: '80%' }} record={item} columns={3}>
                <div className="c7ncd-base-pvlabels" colSpan={2}>
                  <div>
                    <Select style={{ width: 219 }} combo name="key" />
                  </div>
                  <span style={{ margin: '0 6px' }}>=</span>
                  <div>
                    <TextField style={{ width: 219 }} name="value" />
                  </div>
                  <Button
                    funcType="flat"
                    style={{
                      flexShrink: 0,
                      marginLeft: 10,
                    }}
                    icon="delete"
                    onClick={() => PVLabelsDataSet.remove(item)}
                  />
                </div>
              </Form>
            </>
          )),
          <Button
            icon="add"
            color="primary"
            funcType="flat"
            style={{
              display: 'block',
              flexShrink: 0,
              flexGrow: 0,
              width: 'max-content',
            }}
            onClick={() => PVLabelsDataSet.create()}
          >
            添加PV标签
          </Button>,
          ],
      // <YamlEditor
      //   readOnly={false}
      //   value={BaseDeployDataSet.current.get(mapping.values.name)}
      //   onValueChange={(data) => BaseDeployDataSet.current.set(mapping.values.name, data)}
      // />,
      // <ResourceSetting
      //   networkRef={networkRef}
      //   domainRef={domainRef}
      //   envId={BaseDeployDataSet.current.get(mapping.env.name)}
      //   style={{
      //     marginTop: 30,
      //   }}
      // />,
      ]
  );

  /**
   * 添加table 一行参数
   */
  const handleAddParams = (isHostInside = false) => {
    if (isHostInside) {
      const ds = HostSettingDataSet
        .records.find((i) => i.get(hostMapping.checked.name)).getState('params');
      ds.create({
        [paramMapping.params.name]: '',
        [paramMapping.defaultParams.name]: '——',
        [paramMapping.paramsScope.name]: '——',
        [paramMapping.paramsRunnigValue.name]: '',
        custom: 'true',
      }, ds.records.length);
      HostSettingDataSet
        .records.find((i) => i.get(hostMapping.checked.name)).setState('params', ds);
    } else {
      ParamSettingDataSet.create({
        [paramMapping.params.name]: '',
        [paramMapping.defaultParams.name]: '——',
        [paramMapping.paramsScope.name]: '——',
        [paramMapping.paramsRunnigValue.name]: '',
        custom: 'true',
      }, ParamSettingDataSet.records.length);
    }
  };

  /**
   * 删除按钮disabled属性
   */
  const deleteHostDisabled = (baseDataSet, hostDataSet) => {
    const deployMode = baseDataSet.current.get(mapping.deployMode.name);
    // redis
    if (baseDataSet.current.get(mapping.middleware.name) === middleWareData[0].value) {
      // 哨兵
      if (deployMode === deployModeOptionsData[1].value) {
        if (hostDataSet.records.length <= 3) {
          return true;
        }
        return false;
      }
      //  单机
      if (hostDataSet.records.length <= 1) {
        return true;
      }
    } else {
      // mysql
      // eslint-disable-next-line no-lonely-if
      if (deployMode === deployModeOptionsData[0].value) {
        // 单机
        return true;
      }
      // 主备
      if (hostDataSet.records.length <= 2) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="c7ncd-baseDeploy-middle">
      <p className="c7ncd-baseDeploy-middle-service">选择中间件服务</p>
      <div className="c7ncd-baseDeploy-middle-img">
        <span
          role="none"
          onClick={() => {
            BaseDeployDataSet.current.set(mapping.middleware.name, middleWareData[0].value);
          }}
        >
          <img
            src={redis}
            alt=""
            className={classNames({
              'c7ncd-baseDeploy-middle-img-checked': BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[0].value,
            })}
          />
          {
            BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[0].value && (
              <Icon type="check_circle" />
            )
          }
        </span>
        <span
          role="none"
          onClick={() => {
            BaseDeployDataSet.current.set(
              mapping.middleware.name, middleWareData[1].value,
            );
          }}
        >
          <img
            style={{ marginLeft: 20 }}
            src={mysql}
            alt=""
            className={classNames({
              'c7ncd-baseDeploy-middle-img-checked':
        BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[1].value,
            })}
          />
          {
            BaseDeployDataSet.current.get(mapping.middleware.name)
        === middleWareData[1].value && (
        <Icon type="check_circle" />
            )
          }
        </span>
      </div>
      <Form columns={2} style={{ width: '80%', marginTop: 25 }} dataSet={BaseDeployDataSet}>
        <Select colSpan={1} name={mapping.serviceVersion.name} />
      </Form>
      <p className="c7ncd-baseDeploy-middle-deploySetting">
        部署设置
        <Icon type="expand_less" />
      </p>
      <Form columns={3} style={{ width: '80%', marginTop: 16 }} dataSet={BaseDeployDataSet}>
        <SelectBox colSpan={1} name={mapping.deployWay.name} />
        { renderDomBaseOnDeployWay }
      </Form>
      {
        renderBottomDomBaseOnDeployWay()
      }
      {
        (BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[1].value
          && BaseDeployDataSet
            .current.get(mapping.deployWay.name) === deployWayOptionsData[1].value)
          ? '' : (
            <>
              <Table
                style={{ marginTop: 20 }}
                queryBar="none"
                dataSet={ParamSettingDataSet}
                rowHeight={60}
              >
                <Column name={paramMapping.params.name} renderer={renderParams} />
                <Column name={paramMapping.defaultParams.name} />
                <Column name={paramMapping.paramsScope.name} renderer={renderParamsScope} />
                <Column
                  name={paramMapping.paramsRunnigValue.name}
                  renderer={renderParamsRunningValue}
                />
                <Column
                  width={60}
                  renderer={({ record }) => renderOperation({ record, isHostInside: false })}
                />
              </Table>
              <div>
                <Button
                  funcType="flat"
                  icon="add"
                  color="primary"
                  style={{
                    margin: '20px 0',
                    position: 'relative',
                    flexShrink: 0,
                    flexGrow: 0,
                    width: 'max-content',
                  }}
                  onClick={() => handleAddParams()}
                >
                  添加参数
                </Button>
              </div>
            </>
          )
      }

    </div>
  );
});
