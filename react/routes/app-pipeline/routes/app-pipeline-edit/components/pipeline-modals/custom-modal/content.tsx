import React from 'react';
import { YamlEditor } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { useCustomModalStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/custom-modal/stores';
import { mapping, transformSubmitData } from './stores/customDataSet';
import CloseModal from '../close-modal';

const Index = observer(() => {
  const {
    CustomDataSet,
    modal,
    handleJobAddCallback,
    data,
  } = useCustomModalStore();

  const handleOk = async () => new Promise((resolve) => {
    const subData = transformSubmitData(data, CustomDataSet);
    handleJobAddCallback({
      ...subData,
      completed: true,
    });
    resolve(true);
  });

  return (
    <>
      <CloseModal modal={modal} />
      <YamlEditor
        readOnly={false}
        modeChange={false}
        showError={false}
        value={CustomDataSet?.current?.get(mapping.value.name)}
        onValueChange={(value: any) => {
          CustomDataSet.current.set(mapping.value.name, value);
          handleOk();
        }}
      />
    </>
  );
});

export default Index;
