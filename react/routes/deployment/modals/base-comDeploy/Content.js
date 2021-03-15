import React, { useMemo, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import {
  Select, Form, SelectBox, TextField, Button, Table,
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
import { mapping as paramMapping } from './stores/paramSettingDataSet';
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
  } = useBaseComDeployStore();

  console.log(modal);

  const networkRef = useRef();
  const domainRef = useRef();

  modal.handleOk(async () => {
    const middleWare = BaseDeployDataSet.current.get(mapping.middleware.name);
    let pass;
    let axiosData;
    // redis
    if (middleWare === middleWareData[0].value) {
      // 环境部署
      if (BaseDeployDataSet.current.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
        const devopsServiceReqVo = await networkRef.current.getDevopsServiceReqVO();
        const devopsIngressVO = await domainRef.current.getDevopsIngressVO();
        let resource;
        if (devopsServiceReqVo && devopsIngressVO) {
          resource = {
            ...devopsServiceReqVo,
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
      }
      try {
        await BaseComDeployServices.axiosPostDeployMiddleware(projectId, axiosData);
        refresh();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    // 初始化为哨兵模式 初始化三个record
    HostSettingDataSet.records = [{}, {}, {}];
  }, []);

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
              <Form columns={3} style={{ width: '100%' }} record={HostSettingDataSet}>
                <Select colSpan={1} name={hostMapping.hostName.name} />
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
          >
            测试连接
          </Button>
          <div className="c7ncd-baseDeploy-middle-testButton-result">
            <span>测试连接:</span>
            <span>
              <Icon type="check" />
              成功
            </span>
          </div>
        </div>
        <p style={{ marginTop: 30 }} className="c7ncd-baseDeploy-middle-deploySetting">
          参数配置
          <Icon type="expand_less" />
        </p>
        <Table style={{ marginTop: 20 }} queryBar="none" dataSet={ParamSettingDataSet}>
          <Column name={paramMapping.params.name} />
          <Column name={paramMapping.defaultParams.name} />
          <Column name={paramMapping.paramsScope.name} />
          <Column name={paramMapping.paramsRunnigValue.name} />
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
