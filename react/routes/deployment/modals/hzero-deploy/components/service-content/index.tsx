import React, {
  useCallback, useMemo, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Form,
  TextField,
  Menu,
  Dropdown,
} from 'choerodon-ui/pro';
import { map, filter, isEmpty } from 'lodash';
import classnames from 'classnames';
import { axios } from '@choerodon/master';
import { Loading } from '@choerodon/components';
import eventStopProp from '@/utils/eventStopProp';
import {
  Record, FuncType, Placements,
} from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import { useHzeroDeployStore } from '../../stores';

interface ServiceItemProps {
  id: string,
  values: string,
  marketServiceName: string,
  marketServiceCode: string,
  required: boolean,
}

const ServiceContent = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    modal,
    formDs,
    serviceDs,
    mainStore,
    refresh,
  } = useHzeroDeployStore();

  // 记录点击展开下拉内容的HZERO服务record的index
  const [recordIndex, setRecordIndex] = useState<number | never>();

  modal.handleOk(async () => {
    try {
      const [res1, res2] = await axios.all([formDs.validate(), serviceDs.validate()]);
      if (res1 && res2) {
        await formDs.submit();
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const menuData = useMemo(() => mainStore.getServiceData, [mainStore.getServiceData]);

  const handleSelect = useCallback(({ domEvent, key }) => {
    eventStopProp(domEvent);
    const data = menuData.find((item: ServiceItemProps) => item.id === key);
    data && recordIndex && serviceDs.get(recordIndex)?.set(data);
  }, [recordIndex, menuData]);

  const menu = () => {
    const realMenuData = filter(menuData, (item: ServiceItemProps) => !serviceDs.some((serviceRecord) => serviceRecord.get('id') === item?.id));
    if (isEmpty(realMenuData)) {
      return (
        <Menu>
          <Menu.Item>
            <span className={`${prefixCls}-empty`}>{formatMessage({ id: 'nodata' })}</span>
          </Menu.Item>
        </Menu>
      );
    }
    return (
      <Menu onClick={handleSelect}>
        {map(realMenuData, (item: ServiceItemProps) => (
          <Menu.Item key={item?.id}>{item?.marketServiceName}</Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleClickExpand = useCallback((e, record: Record) => {
    eventStopProp(e);
    setRecordIndex(record.index);
  }, []);

  const serviceClassNames = useCallback((record: Record) => classnames(
    `${prefixCls}-content-service-item`,
    {
      selected: record === serviceDs.current,
      disabled: record.get('required'),
    },
  ), [serviceDs.current]);

  const handleDeleteService = useCallback((e, record: Record) => {
    eventStopProp(e);
    serviceDs.remove(record);
  }, []);

  const handleAddService = useCallback(() => {
    serviceDs.create();
  }, []);

  const handleClickService = useCallback((record: Record) => {
    serviceDs.current = record;
  }, []);

  const ChangeConfigValue = useCallback((value) => {
    serviceDs.current?.set('values', value);
  }, [serviceDs.current]);

  const handleEnableNext = useCallback((flag: boolean) => {
    serviceDs.current?.set('valueFailed', flag);
  }, [serviceDs.current]);

  if (serviceDs.status === 'loading') {
    return <Loading display type="c7n" />;
  }

  if (!serviceDs.length) {
    return <span>暂无数据</span>;
  }

  return (
    <div className={`${prefixCls}-content`}>
      <div className={`${prefixCls}-content-service`}>
        {serviceDs.map((serviceRecord: Record) => (
          <div
            key={serviceRecord.id}
            className={serviceClassNames(serviceRecord)}
            onClick={() => handleClickService(serviceRecord)}
            role="none"
          >
            <span>
              {serviceRecord.get('marketServiceName') || formatMessage({ id: `${intlPrefix}.placeholder` })}
            </span>
            {serviceRecord.get('required') ? (
              <span className={`${prefixCls}-content-service-required`}>必选</span>
            ) : (
              <div className={`${prefixCls}-content-service-btn`}>
                <Button
                  icon="delete_forever-o"
                  funcType={FuncType.flat}
                  onClick={(e) => handleDeleteService(e, serviceRecord)}
                />
                <Dropdown
                  overlay={menu()}
                  // @ts-ignore
                  trigger={['click']}
                  placement={'bottomRight' as Placements}
                  popupClassName={`${prefixCls}-dropdown-popup`}
                >
                  <Button
                    icon="expand_more"
                    funcType={FuncType.flat}
                    onClick={(e) => handleClickExpand(e, serviceRecord)}
                  />
                </Dropdown>
              </div>
            )}
          </div>
        ))}
        <Button
          onClick={handleAddService}
          funcType={FuncType.flat}
          className={`${prefixCls}-content-service-add`}
          icon="add"
          disabled={menuData?.length === serviceDs.length}
        >
          {formatMessage({ id: `${intlPrefix}.add` })}
        </Button>
      </div>
      <Form
        record={serviceDs.current}
        columns={2}
        className={`${prefixCls}-content-form`}
      >
        <TextField
          name="marketServiceVersion"
          disabled
        />
        <TextField name="instanceName" />
        <YamlEditor
          colSpan={2}
          readOnly={false}
          value={serviceDs?.current?.get('values') || ''}
          onValueChange={ChangeConfigValue}
          handleEnableNext={handleEnableNext}
        />
      </Form>
    </div>
  );
});

export default ServiceContent;
