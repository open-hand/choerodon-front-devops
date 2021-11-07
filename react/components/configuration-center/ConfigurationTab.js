/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Table, Form, TextField, Icon, Button, Tooltip, Select, DataSet,
} from 'choerodon-ui/pro';
import { Input, message } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isEmpty, every } from 'lodash';
import styles from './index.less';

export const queryConfigCodeOptions = (configCompareOptsDS, configurationCenterDataSet) => {
  configurationCenterDataSet.forEach(async (o, index) => {
    configCompareOptsDS.setQueryParameter(
      'configGroup',
      configurationCenterDataSet.get(index)?.get('configGroup'),
    );
    await configCompareOptsDS.query();
    configurationCenterDataSet.getField('versionName').set('options', configCompareOptsDS);
    if (configCompareOptsDS.length > 0) {
      const { value: optValue, meaning } = configCompareOptsDS.get(0).toData();
      configurationCenterDataSet.get(index).set('versionName', optValue);
    } else {
      configurationCenterDataSet.current.init('configCode', '');
    }
  });
};

const Content = observer((props) => {
  const { configurationCenterDataSet, configCompareOptsDS } = props;
  const [content, setContent] = useState('');
  const configNameMap = new Map();

  useEffect(() => {
    queryVersionOptions();
  }, [configurationCenterDataSet.current]);

  useEffect(() => {
    queryConfigCodeOptions(configCompareOptsDS, configurationCenterDataSet);
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'mountPath',
        renderer: ({ record }) => (
          <Form record={record} key="type-form" labelLayout="float">
            <TextField name="mountPath" label="挂载路径" />
          </Form>
        ),
      },
      {
        name: 'configGroup',
        renderer: ({ record }) => (
          <Form record={record} key="type-form" labelLayout="float">
            <Select name="configGroup" label="配置分组" onChange={handleGroupChange} />
          </Form>
        ),
      },
      {
        name: 'configCode',
        renderer: ({ record }) => (
          <Form record={record} key="type-form" labelLayout="float">
            <Select
              name="configCode"
              label="配置文件"
              onChange={handleChangeCode}
              noCache
              optionRenderer={optionRenderer}
            />
          </Form>
        ),
      },
      {
        name: 'versionName',
        editor: false,
        renderer: ({ record }) => (
          <Form record={record} key="type-form" labelLayout="float" disabled>
            <TextField name="versionName" label="配置文件版本" />
          </Form>
        ),
      },
      {
        header: '操作',
        width: 80,
        renderer: ({ record }) => (
          <div className={styles['c7ncd-action-link']}>
            <Tooltip title="点击后将复制由挂载路径和配置文件名称组合而成的路径，配置文件按照此路径存储于主机中。可以把复制的配置文件路径应用在前置操作、启动命令、以及后置操作等地方。">
              <Button
                className={styles['c7ncd-action-button']}
                onClick={() => copyContent(record)}
                disabled={
                  !every(
                    [
                      record.get('mountPath'),
                      record.get('configGroup'),
                      record.get('configCode'),
                      record.get('versionName'),
                    ],
                    Boolean,
                  )
                }
              >
                <Icon type="content_copy" className={styles['c7ncd-action-icon']} />
              </Button>
            </Tooltip>
            <Button
              className={styles['c7ncd-action-button']}
              onClick={() => configurationCenterDataSet.delete(record)}
            >
              <Icon type="delete_black-o" className={styles['c7ncd-action-icon']} />
            </Button>
          </div>
        ),
      },
    ],
    [configurationCenterDataSet.current, configCompareOptsDS.current],
  );

  const optionRenderer = ({ text, value }) => {
    configNameMap.set(value, text);
    return text;
  };

  const handleGroupChange = () => {
    configurationCenterDataSet.current?.set('versionName', '');
    configurationCenterDataSet.current?.set('configCode', '');
  };

  // 新建配置文件
  // eslint-disable-next-line consistent-return
  const handleCreate = async () => {
    if (isEmpty(configurationCenterDataSet)) {
      configurationCenterDataSet.create({}, 0);
    } else {
      const {
        mountPath,
        configGroup,
        configCode,
        versionName,
      } = configurationCenterDataSet.current?.toData();
      const isEmptyRecord = every([mountPath, configGroup, configCode, versionName], Boolean);
      const validate = await configurationCenterDataSet.validate();
      if (validate && isEmptyRecord) {
        configurationCenterDataSet.create({}, 0);
      } else if (isEmptyRecord) {
        return false;
      }
    }
  };

  // 复制配置文件
  const copyContent = async (record) => {
    const configName = configNameMap.get(record.get('configCode'));
    const text = `${record.get('mountPath')}${configName}`;
    await setContent(text);
    setTimeout(handleCopy(), 100);
  };

  const handleCopy = () => {
    const input = document.querySelector('#copyTarget');
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      message.success('复制成功');
    } else {
      message.error('复制失败');
    }
  };

  // 联动显示配置版本
  const queryVersionOptions = async (currentValue) => {
    configCompareOptsDS.setQueryParameter(
      'configGroup',
        configurationCenterDataSet.current?.get('configGroup'),
    );
    await configCompareOptsDS.query();
    configurationCenterDataSet.getField('versionName').set('options', configCompareOptsDS);
    if (configCompareOptsDS.length > 0) {
      const { value: optValue } = configCompareOptsDS.get(0).toData();
      configurationCenterDataSet.current.set('versionName', optValue);
    } else {
      configurationCenterDataSet.current.init('configCode', '');
    }
  };

  const handleChangeCode = async (currentValue) => {
    if (currentValue) {
      queryVersionOptions();
    } else {
      configurationCenterDataSet.current.init('configCode', '');
    }
  };

  return (
    <>
      <Table
        dataSet={configurationCenterDataSet}
        columns={columns}
        queryBar="none"
        pagination={false}
        rowHeight=".8rem"
        showHeader={false}
        border={false}
      />
      <Button onClick={handleCreate} funcType="flat">
        <Icon type="add" />
        添加配置文件
      </Button>
      <Input
        id="copyTarget"
        value={content}
        style={{ height: '0', position: 'relative', zIndex: -1 }}
      />
    </>
  );
});

export default Content;
