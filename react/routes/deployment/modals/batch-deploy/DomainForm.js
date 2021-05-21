import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Form, Icon, Select, SelectBox, TextField, TextArea } from 'choerodon-ui/pro';
import map from 'lodash/map';
import { useBatchDeployStore } from './stores';
import Tips from '../../../../components/new-tips';

const { Option } = SelectBox;

export default observer(() => {
  const {
    intl: { formatMessage },
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

  function handleRemovePath(removeRecord) {
    pathListDs.remove(removeRecord);
  }

  function handleAddAnnotation() {
    annotationDs.create();
  }

  function handleRemoveAnnotation(annotationRecord) {
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
        {!record.get('isNormal') && <Select name="certId" disabled={batchDeployDs.current && !batchDeployDs.current.get('environmentId')} searchable />}
      </Form>
      {map(pathListDs.data, (pathRecord) => (
        <Form record={pathRecord} columns={6} style={{ width: '115%' }} key={pathRecord.id}>
          <TextField name="path" colSpan={2} disabled={!record.get('domain')} />
          <TextField name="serviceName" colSpan={2} disabled />
          <Select name="servicePort" disabled={!pathRecord.get('serviceName')}>
            {map(pathRecord.get('ports'), (port) => <Option value={port} key={port}>{port}</Option>)}
          </Select>
          {pathListDs.length > 1 ? (
            <Button
              funcType="flat"
              icon="delete"
              className={`${prefixCls}-domain-form-delete`}
              onClick={() => handleRemovePath(pathRecord)}
            />
          ) : <span />}
        </Form>
      ))}
      <Button
        funcType="flat"
        color="primary"
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
          style={{ width: '103.3%' }}
          key={annotationRecord.id}
          className={`${prefixCls}-resource-domain-annotation`}
        >
          <TextField colSpan={6} name="key" />
          <span className={`${prefixCls}-resource-domain-annotation-equal`}>=</span>
          <TextArea
            colSpan={6}
            name="value"
            autoSize={{ minRows: 1 }}
            resize="vertical"
          />
          {annotationDs.length > 1 ? (
            <Button
              funcType="flat"
              icon="delete"
              onClick={() => handleRemoveAnnotation(annotationRecord)}
            />
          ) : <span />}
        </Form>
      ))}
      <Button
        funcType="flat"
        color="primary"
        icon="add"
        onClick={handleAddAnnotation}
      >
        {formatMessage({ id: 'domain.annotation.add' })}
      </Button>
    </div>
  );
});
