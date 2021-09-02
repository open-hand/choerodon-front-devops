import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Tooltip, Select, Button,
} from 'choerodon-ui/pro';
import { some } from 'lodash';
import { RecordObjectProps, Record, FuncType } from '@/interface';
import { useLinkServiceStore } from '@/routes/app-center/app-list/components/link-service/stores';
import EnvOption from '@/components/env-option';

const LinkService = () => {
  const {
    linkServiceDs,
    formDs,
    refresh,
    modal,
    showEnvSelect = false,
  } = useLinkServiceStore();

  modal.handleOk(async () => {
    try {
      const res = await formDs.submit();
      if (res) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const handleDelete = useCallback((record) => {
    linkServiceDs.remove(record);
  }, []);

  const handleAdd = useCallback(() => {
    linkServiceDs.create();
  }, []);

  const optionsFilter = useCallback((optionRecord: Record) => {
    const flag = some(linkServiceDs.created, (record: Record) => record.get('appServiceId') === optionRecord.get('id'));
    return !flag;
  }, [linkServiceDs.created]);

  const optionsRenderer = useCallback(({ record }: RecordObjectProps) => {
    const name = record.get('name');
    return <Tooltip title={name}>{name}</Tooltip>;
  }, []);

  const renderEnvOption = useCallback(({ record, text }) => (
    <EnvOption record={record} text={text} />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission'),
  }), []);

  return (
    <>
      {showEnvSelect && (
        <Form dataSet={formDs}>
          <Select
            name="envId"
            searchable
            clearButton={false}
            optionRenderer={renderEnvOption}
            onOption={renderOptionProperty}
          />
        </Form>
      )}
      {linkServiceDs.map((record: Record) => (
        <Form record={record} columns={11} key={record.id}>
          <Select
            optionsFilter={optionsFilter}
            optionRenderer={optionsRenderer}
            name="appServiceId"
            searchable
            colSpan={10}
          />
          <Button
            icon="delete"
            funcType={'flat' as FuncType}
            onClick={() => handleDelete(record)}
            disabled={linkServiceDs.created?.length === 1}
            className="c7ncd-form-record-delete-btn"
          />
        </Form>
      ))}
      <Button
        icon="add"
        funcType={'flat' as FuncType}
        onClick={handleAdd}
      >
        添加应用服务
      </Button>
    </>
  );
};

export default observer(LinkService);
