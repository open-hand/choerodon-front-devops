import React, { useMemo } from 'react';
import {
  Form, TextField, SelectBox, Select, Spin, Password,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { useAddTemplateStore } from './stores';
import { mapping } from './stores/FormDataSet';

export default observer(() => {
  const {
    formDs,
    templateId,
    modal,
    refresh,
    organizationId,
  } = useAddTemplateStore();

  const record = useMemo(() => formDs.current, [formDs.current]);

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

  const renderCreateWayDom = () => {
    if (!record) {
      return '';
    }
    const createWayValue = record.get(mapping.createWay.name);
    switch (createWayValue) {
      case 'template':
        return <Select name={mapping.appTemplate.name} />;
        break;
      case 'gitlab':
        return [
          <TextField name={mapping.gitlabAddress.name} />,
          <Password name={mapping.token.name} />,
        ];
        break;
      case 'github':
        return [
          <TextField name={mapping.githubAddress.name} />,
        ];
      default:
        return '';
    }
  };

  // @ts-ignore
  if (!record || record.status === 'loading') {
    return <Spin />;
  }

  return (
    <Form className="c7ncd-appAddTemplate-form" dataSet={formDs}>
      <TextField name={mapping.templateName.name} autoFocus />
      <TextField name={mapping.templateCode.name} disabled={!!templateId} />
      {!templateId && ([
        <SelectBox name={mapping.createWay.name} />,
        renderCreateWayDom(),
      ])}
    </Form>
  );
});
