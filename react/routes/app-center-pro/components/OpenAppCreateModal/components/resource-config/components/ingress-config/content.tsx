import React, { useImperativeHandle, useEffect } from 'react';
import {
  Form, TextField, SelectBox, Select, Button, TextArea,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { useIngressConfig } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/ingress-config/stores';
import {
  FuncType, Record, ButtonColor, ResizeType,
} from '@/interface';

const { Option } = Select;

const Index = observer(() => {
  const {
    IngressDataSet,
    envId,
    PathListDataSet,
    AnnotationDataSet,
    cRef,
    netName,
    portsList,
  } = useIngressConfig();

  useEffect(() => {
    PathListDataSet.records.forEach((record: any) => {
      record.set('serviceName', netName);
    });
  }, [netName]);

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const ingressFlag = await IngressDataSet.validate();
      const pathFlag = await PathListDataSet.validate();
      const annotationFlag = await AnnotationDataSet.validate();
      if (ingressFlag && pathFlag && annotationFlag) {
        const ingressData = IngressDataSet.current.toData();
        const annotationData = AnnotationDataSet.toData();
        const annotation = {};
        annotationData.forEach((item: any) => {
          // @ts-ignore
          annotation[item.key as string] = item.value;
        });
        if (!ingressData.name) {
          return null;
        }
        return ({
          name: ingressData.name,
          domain: ingressData.domain,
          pathList: PathListDataSet.toData(),
          annotation,
          // ingress: IngressDataSet.toData(),
          // path: PathListDataSet.toData(),
          // annotation: AnnotationDataSet.toData(),
        });
      }
      return false;
    },
  }));

  function handleRemovePath(removeRecord:Record) {
    PathListDataSet.remove(removeRecord);
  }

  function handleAddPath() {
    PathListDataSet.create();
  }

  function handleRemoveAnnotation(annotationRecord: any) {
    AnnotationDataSet.remove(annotationRecord);
  }

  function handleAddAnnotation() {
    AnnotationDataSet.create();
  }

  console.log(portsList);

  return (
    <div className="c7ncd-appCenterPro-ingressConfig">
      <p className="c7ncd-appCenterPro-newConfig__title">域名（Ingress)</p>
      <Form dataSet={IngressDataSet}>
        <TextField name="name" disabled={!envId} />
        <SelectBox name="isNormal" />
        <TextField name="domain" disabled={!envId} />
        {!IngressDataSet.current.get('isNormal') && <Select name="certId" disabled={!envId} searchable />}
      </Form>
      {
        PathListDataSet.records.map((pathRecord: any) => (
          <Form columns={6} record={pathRecord}>
            <TextField name="path" colSpan={2} disabled={!IngressDataSet.current.get('domain')} />
            <TextField name="serviceName" colSpan={2} disabled />
            <Select name="servicePort" disabled={!pathRecord.get('serviceName')}>
              {map(portsList || [], (port) => <Option value={port} key={port}>{port}</Option>)}
            </Select>
            {PathListDataSet.records.length > 1 ? (
              <Button
                funcType={'flat' as FuncType}
                icon="delete"
                onClick={() => handleRemovePath(pathRecord)}
              />
            ) : <span />}
          </Form>
        ))
      }
      <Button
        funcType={'flat' as FuncType}
        color={'primary' as ButtonColor}
        icon="add"
        onClick={() => handleAddPath()}
      >
        添加路径
      </Button>
      <p className="c7ncd-appCenterPro-newConfig__title">Annotations</p>
      {
        AnnotationDataSet.records.map((annotationRecord: any) => (
          <Form
            columns={29}
            record={annotationRecord}
            style={{ width: '103.3%' }}
            key={annotationRecord.id}
          >
            <TextField name="key" colSpan={13} />
            <span>=</span>
            <TextArea
              name="value"
              autoSize={{ minRows: 1 }}
              resize={'vertical' as ResizeType}
              colSpan={13}
            />
            {AnnotationDataSet.records.length > 1 ? (
              <Button
                funcType={'flat' as FuncType}
                icon="delete"
                onClick={() => handleRemoveAnnotation(annotationRecord)}
                className="c7ncd-form-record-delete-btn"
                // @ts-ignore
                colSpan={2}
              />
            ) : (
              // @ts-ignore
              <span colSpan={2} />
            )}
          </Form>
        ))
      }
      <Button
        funcType={'flat' as FuncType}
        color={'primary' as ButtonColor}
        icon="add"
        onClick={() => handleAddAnnotation()}
      >
        添加Annotation
      </Button>
    </div>
  );
});

export default Index;
