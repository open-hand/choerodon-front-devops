import React from 'react';
import { Form, TextField, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { mapping } from './stores/buildDataSet';
import CloseModal from '../close-modal';
import { useBuildModalStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores';
import StepTitle from '../step-title';
import SideStep from '../side-step';

import './index.less';

const prefix = 'c7ncd-buildModal-content';

const Index = observer(() => {
  const {
    modal,
    BuildDataSet,
  } = useBuildModalStore();
  return (
    <div className={prefix}>
      <CloseModal modal={modal} />
      <SideStep />
      <div className={`${prefix}__main`}>
        <Form className={`${prefix}__main__public`} dataSet={BuildDataSet} columns={6}>
          <TextField name={mapping.name.name} colSpan={3} />
          <Select name={mapping.appService.name} colSpan={3} />
          <Select name={mapping.triggerType.name} colSpan={2} />
          <Select name={mapping.triggerValue.name} colSpan={4} />
        </Form>
        <div className={`${prefix}__main__divided`} />
        <StepTitle
          title="步骤配置"
          buttons={[{
            text: '添加步骤',
            icon: 'add',
          }]}
        />
      </div>
    </div>
  );
});

export default Index;
