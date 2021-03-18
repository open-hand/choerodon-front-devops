import React, { useMemo, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import {
  Select, Form, SelectBox, TextField, Button, Table, Tooltip, message,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import YamlEditor from '@/components/yamlEditor';
import StatusDot from '@/components/status-dot';
import BaseComDeployServices from '@/routes/deployment/modals/base-comDeploy/services';
import ResourceSetting from './components/resource-setting';
import {
  mapping, deployWayOptionsData, deployModeOptionsData, middleWareData,
} from './stores/baseDeployDataSet';
import { mapping as hostMapping } from './stores/hostSettingDataSet';
import paramSettingDataSet, { mapping as paramMapping } from './stores/paramSettingDataSet';
import { useBaseComDeployStore } from './stores';
import redis from './images/redis.png';
import mysql from './images/mysql.png';

import './index.less';

const { Column } = Table;

export default observer(() => {
  const {
    BaseDeployDataSet,
    HostSettingDataSet,
    ParamSettingDataSet,
    modal,
    AppState: { currentMenuType: { projectId } },
    refresh,
    deployWay,
  } = useBaseComDeployStore();

  const networkRef = useRef();
  const domainRef = useRef();

  modal.handleOk(async () => {
    const middleWare = BaseDeployDataSet.current.get(mapping.middleware.name);
    let pass;
    let axiosData;
    let flag = false;
    // redis
    if (middleWare === middleWareData[0].value) {
      // 环境部署
      if (BaseDeployDataSet.current.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
        const devopsServiceReqVO = await networkRef.current.getDevopsServiceReqVO();
        const devopsIngressVO = await domainRef.current.getDevopsIngressVO();
        let resource;
        if (devopsServiceReqVO && devopsIngressVO) {
          if (!devopsServiceReqVO?.devopsServiceReqVO?.name) {
            devopsServiceReqVO.devopsServiceReqVO = null;
          }
          if (!devopsIngressVO?.devopsIngressVO?.name) {
            devopsIngressVO.devopsIngressVO = null;
          }
          resource = {
            ...devopsServiceReqVO,
            ...devopsIngressVO,
          };
        } else {
          return false;
        }
        axiosData = {
          ...resource,
        };
        pass = await BaseDeployDataSet.validate();
        // 如果通过校验
        if (pass) {
          axiosData = {
            ...axiosData,
            [mapping.serviceVersion.name]: BaseDeployDataSet
              .toData()[0][mapping.serviceVersion.name],
            [mapping.deployMode.name]: BaseDeployDataSet
              .toData()[0][mapping.deployMode.name],
            [mapping.env.name]: BaseDeployDataSet
              .toData()[0][mapping.env.name],
            [mapping.instance.name]: BaseDeployDataSet
              .toData()[0][mapping.instance.name],
            [mapping.values.name]: BaseDeployDataSet
              .toData()[0][mapping.values.name],
            type: 'create',
            isNotChange: false,
          };
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
          for (let i = 0; i < ParamSettingDataSet.records.length; i += 1) {
            const result = handleValidParamsRunningValue(ParamSettingDataSet
              .records[i].get(paramMapping.paramsRunnigValue.name), ParamSettingDataSet.records[i]);
            if (result !== true) {
              flag = true;
              break;
            }
          }
          const configuration = {};
          ParamSettingDataSet.records.forEach((i) => {
            configuration[i.get(paramMapping.params.name)] = i
              .get(paramMapping.paramsRunnigValue.name);
          });
          if (!flag) {
            axiosData = {
              hostIds: HostSettingDataSet.records.map((i) => i.get(hostMapping.hostId.name)),
              [mapping.deployMode.name]: BaseDeployDataSet.current.get(mapping.deployMode.name),
              name: BaseDeployDataSet.current.get(mapping.resourceName.name),
              [mapping.serviceVersion.name]: BaseDeployDataSet
                .current.get(mapping.serviceVersion.name),
              configuration,
            };
          }
        } else {
          return false;
        }
      }
      if (!flag) {
        try {
          if (BaseDeployDataSet
            .current.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
            await BaseComDeployServices.axiosPostDeployMiddleware(projectId, axiosData);
          } else {
            await BaseComDeployServices.axiosPostDeployHost(projectId, axiosData);
          }
          refresh();
          return true;
        } catch (e) {
          return false;
        }
      }
    }
    return false;
  });

  useEffect(() => {
    // 初始化为哨兵模式 初始化三个record
    HostSettingDataSet.create();
    HostSettingDataSet.create();
    if (deployWay) {
      BaseDeployDataSet.current.set(mapping.deployWay.name, deployWay);
    }
  }, []);

  useEffect(() => {
    const middleware = BaseDeployDataSet.current.get(mapping.middleware.name);
    const deployWary = BaseDeployDataSet.current.get(mapping.deployWay.name);
    HostSettingDataSet.getField(hostMapping.hostName.name).set('required', (middleware === middleWareData[0].value) && (deployWary === deployWayOptionsData[1].value));
  }, [
    BaseDeployDataSet.current.get(mapping.middleware.name),
    BaseDeployDataSet.current.get(mapping.deployWay.name),
  ]);

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

  const renderDomBaseOnDeployWay = useMemo(() => (
    BaseDeployDataSet.current
      .get(mapping.deployWay.name) === deployWayOptionsData[1].value ? [
        <TextField style={{ visibility: 'hidden' }} colSpan={1} />,
        <SelectBox colSpan={1} name={mapping.deployMode.name} />,
        <TextField newLine colSpan={1} name={mapping.resourceName.name} />,
      ] : [
        <SelectBox colSpan={1} name={mapping.deployMode.name} />,
        <Select
          newLine
          colSpan={1}
          name={mapping.env.name}
          optionRenderer={renderEnvOption}
          onOption={renderOptionProperty}
        />,
        <TextField colSpan={1} name={mapping.instance.name} />,
      ]
  ), [BaseDeployDataSet.current
    .get(mapping.deployWay.name)]);

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
  const handleTestConnect = async () => {
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
    if (record.get) {
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
    <Form>
      <TextField
        required
        value={value}
        onChange={(text) => record.set(paramMapping.paramsRunnigValue.name, text)}
        validator={(values) => handleValidParamsRunningValue(values, record)}
      />
    </Form>
  );

  /**
   * table 参数render
   * @param value
   * @param record
   * @returns {*}
   */
  const renderParams = ({ value, record }) => (
    <span>
      {value}
      <Tooltip title={(<span style={{ whiteSpace: 'pre-line' }}>{record.get(paramMapping.tooltip.name)}</span>)}>
        <Icon
          style={{
            color: 'rgba(0, 0, 0, 0.36)',
            position: 'relative',
            bottom: '2px',
          }}
          type="help"
        />
      </Tooltip>
    </span>
  );

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
      message.error('请输入数字');
      return '该字段为必填';
    }
    const itemScope = record.get(paramMapping.paramsScope.name);
    if (itemScope.includes('～')) {
      //  为区间
      if (parseFloat(values).toString() === 'NaN') {
        message.error('请输入数字');
        return '请输入数字';
      }
      const scope = itemScope.split('～');
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

  const renderBottomDomBaseOnDeployWay = () => (
    BaseDeployDataSet.current.get(mapping.deployWay.name) === deployWayOptionsData[1].value ? (
      <>
        <p className="c7ncd-baseDeploy-middle-deploySetting">
          主机设置
          <Icon type="expand_less" />
        </p>
        {
          HostSettingDataSet.records.filter((i) => !i.isRemoved).map((record) => (
            <div style={{ position: 'relative', width: '80%' }}>
              <Form columns={3} style={{ width: '100%' }} record={record}>
                <Select
                  colSpan={1}
                  name={hostMapping.hostName.name}
                  onOption={(data) => ({
                    disabled: HostSettingDataSet.records.find((i) => i.get(hostMapping.hostName.name) === data.record.get('id')),
                  })}
                />
                <TextField colSpan={1} name={hostMapping.ip.name} />
                <TextField colSpan={1} name={hostMapping.port.name} />
              </Form>
              <Button
                disabled={deleteHostDisabled(BaseDeployDataSet, HostSettingDataSet)}
                icon="delete"
                style={{
                  position: 'absolute',
                  right: '-20px',
                  bottom: '25px',
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
          disabled={addHostDisabled()}
          onClick={handleAddHost}
        >
          添加主机
        </Button>
        <div
          className="c7ncd-baseDeploy-middle-testButton"
        >
          <Button
            funcType="raised"
            color="blue"
            disabled={HostSettingDataSet
              .records.filter((i) => !i.isRemoved).every((i) => !i.get(hostMapping.hostName.name))}
            onClick={handleTestConnect}
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
        <Table
          style={{ marginTop: 20 }}
          queryBar="none"
          dataSet={ParamSettingDataSet}
          rowHeight={60}
        >
          <Column name={paramMapping.params.name} renderer={renderParams} />
          <Column name={paramMapping.defaultParams.name} />
          <Column name={paramMapping.paramsScope.name} renderer={renderParamsScope} />
          <Column name={paramMapping.paramsRunnigValue.name} renderer={renderParamsRunningValue} />
        </Table>
      </>
    ) : [
      <YamlEditor
        readOnly={false}
        value={BaseDeployDataSet.current.get(mapping.values.name)}
        onValueChange={(data) => BaseDeployDataSet.current.set(mapping.values.name, data)}
      />,
      <ResourceSetting
        networkRef={networkRef}
        domainRef={domainRef}
        envId={BaseDeployDataSet.current.get(mapping.env.name)}
        style={{
          marginTop: 30,
        }}
      />,
    ]
  );

  /**
   * 删除按钮disabled属性
   */
  const deleteHostDisabled = (baseDataSet, hostDataSet) => {
    const deployMode = baseDataSet.current.get(mapping.deployMode.name);
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
          style={{
            cursor: 'not-allowed',
          }}
          role="none"
          // onClick={() => {
          //   BaseDeployDataSet.current.set(mapping.middleware.name, middleWareData[1].value);
          // }}
        >
          <img
            style={{ marginLeft: 20 }}
            src={mysql}
            alt=""
            className={classNames({
              'c7ncd-baseDeploy-middle-img-checked': BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[1].value,
            })}
          />
          {
            BaseDeployDataSet.current.get(mapping.middleware.name) === middleWareData[1].value && (
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
    </div>
  );
});
