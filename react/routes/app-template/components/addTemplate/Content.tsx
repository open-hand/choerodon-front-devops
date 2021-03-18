import React, { useMemo } from 'react';
import {
  Form, TextField, SelectBox, Select, Spin, Password,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import Tips from '@/components/new-tips';
import { useAddTemplateStore } from './stores';
import { mapping } from './stores/FormDataSet';

import './index.less';

export default observer(() => {
  const {
    formDs,
    templateId,
    modal,
    refresh,
    organizationId,
    prefixCls,
    formatMessage,
    intlPrefix,
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
    const urlTips = <Tips helpText={formatMessage({ id: `${intlPrefix}.url.tips` })} />;
    switch (createWayValue) {
      case 'template':
        return [
          organizationId ? <SelectBox name={mapping.templateSource.name} /> : null,
          <Select name={mapping.appTemplate.name} searchable searchMatcher="param" />,
        ];
        break;
      case 'gitlab':
        return [
          <TextField name={mapping.gitlabAddress.name} addonAfter={urlTips} />,
          <Password name={mapping.token.name} />,
        ];
        break;
      case 'github':
        return [
          <TextField name={mapping.githubAddress.name} addonAfter={urlTips} />,
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
    <Form className={`${prefixCls}`} dataSet={formDs}>
      <TextField name={mapping.templateName.name} autoFocus />
      <TextField name={mapping.templateCode.name} disabled={!!templateId} />
      {!templateId && ([
        <SelectBox name={mapping.createWay.name} />,
        renderCreateWayDom(),
      ])}
    </Form>
  );
});
