import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { mapping } from './stores/pipelineAdvancedConfigDataSet';
import { usePipelineAdvancedStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';

const Index = observer(() => {
  const {
    PipelineAdvancedConfigDataSet,
  } = usePipelineAdvancedStore();
  return (
    <Form dataSet={PipelineAdvancedConfigDataSet} columns={2}>
      <Select colSpan={2} name={mapping.CIRunnerImage.name} />
      <SelectBox colSpan={1} name={mapping.versionStrategy.name} />
      <TextField colSpan={1} name={mapping.nameRules.name} />
    </Form>
  );
});

export default Index;
