import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Select, SelectBox, TextField, TextArea,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import { useBatchDeployStore } from '../../stores';
import {
  Record,
} from '@/interface';

const { Option } = SelectBox;

export default observer(() => {
  const {
    formatMessage,
    prefixCls,
    batchDeployDs,
    pathListDs,
    domainDs,
    annotationDs,
  } = useBatchDeployStore();

  const record = domainDs.current;

  function handleAddPath() {
    pathListDs.create();
  }

  function handleRemovePath(removeRecord:any) {
    pathListDs.remove(removeRecord);
  }

  function handleAddAnnotation() {
    annotationDs.create();
  }

  function handleRemoveAnnotation(annotationRecord:any) {
    annotationDs.remove(annotationRecord);
  }

  return (
    <div className={`${prefixCls}-resource-domain`}>
      <Form dataSet={domainDs}>
        <TextField name="name" disabled={batchDeployDs.current && !batchDeployDs.current.get('environmentId')} />
        <SelectBox name="isNormal" className={`${prefixCls}-resource-mgt-12`}>
          <Option value>
            <span className={`${prefixCls}-resource-radio`}>{formatMessage({ id: 'domain.protocol.normal' })}</span>
          </Option>
          <Option value={false}>
            <span className={`${prefixCls}-resource-radio`}>{formatMessage({ id: 'domain.protocol.secret' })}</span>
          </Option>
        </SelectBox>
        <TextField name="domain" disabled={batchDeployDs.current && !batchDeployDs.current.get('environmentId')} />
        {!record?.get('isNormal') && <Select name="certId" disabled={batchDeployDs.current && !batchDeployDs.current.get('environmentId')} searchable />}
      </Form>
      {map(pathListDs.data, (pathRecord) => (
        <Form record={pathRecord} columns={14} key={pathRecord.id}>
          <TextField name="path" colSpan={5} disabled={!record?.get('domain')} />
          <TextField name="serviceName" colSpan={5} disabled />
          <Select name="servicePort" disabled={!pathRecord.get('serviceName')} colSpan={3}>
            {map(pathRecord.get('ports'), (port) => <Option value={port} key={port}>{port}</Option>)}
          </Select>
          {pathListDs.length > 1 ? (
            <Button
              funcType={'flat' as any}
              icon="delete"
              className={`${prefixCls}-resource-delete-btn`}
              onClick={() => handleRemovePath(pathRecord)}
            />
          ) : <span />}
        </Form>
      ))}
      <Button
        funcType={'flat' as any}
        color={'primary' as any}
        icon="add"
        onClick={handleAddPath}
      >
        {formatMessage({ id: 'domain.path.add' })}
      </Button>
      <div className={`${prefixCls}-resource-domain-annotation-title`}>
        Annotations
      </div>
      {map(annotationDs.data, (annotationRecord) => (
        <Form
          columns={14}
          record={annotationRecord}
          key={annotationRecord.id}
          className={`${prefixCls}-resource-domain-annotation`}
        >
          <TextField colSpan={6} name="key" />
          <span className={`${prefixCls}-resource-domain-annotation-equal`}>=</span>
          <TextArea
            colSpan={6}
            name="value"
            autoSize={{ minRows: 1 }}
            resize={'vertical' as any}
          />
          {annotationDs.length > 1 ? (
            <Button
              funcType={'flat' as any}
              icon="delete"
              onClick={() => handleRemoveAnnotation(annotationRecord)}
              className={`${prefixCls}-resource-delete-btn`}
            />
          ) : <span />}
        </Form>
      ))}
      <Button
        funcType={'flat' as any}
        color={'primary' as any}
        icon="add"
        onClick={handleAddAnnotation}
      >
        {formatMessage({ id: 'domain.annotation.add' })}
      </Button>
    </div>
  );
});
