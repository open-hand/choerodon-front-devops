import React, { useEffect, useRef } from 'react';
import { YamlEditor } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import yaml from 'js-yaml';
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

  const contentRef = useRef<any>();

  const handleOk = async () => new Promise((resolve) => {
    const subData = transformSubmitData(data, CustomDataSet);
    let name = data?.name;
    yaml.loadAll(CustomDataSet?.current?.get(mapping.value.name), (doc: any) => {
      if (typeof doc === 'object') {
        name = Object.keys(doc)?.[0];
      } else {
        name = '自定义脚本';
      }
    });
    handleJobAddCallback({
      ...subData,
      completed: true,
      name,
    });
    resolve(true);
  });

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        handleOk();
        modal?.close();
      }
    }

    document.addEventListener('dblclick', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('dblclick', handleClickOutside);
    };
  }, [contentRef]);

  return (
    <div ref={contentRef}>
      <CloseModal
        modal={modal}
        preCheck={handleOk}
      />
      <YamlEditor
        readOnly={false}
        modeChange={false}
        showError={false}
        value={CustomDataSet?.current?.get(mapping.value.name)}
        onValueChange={(value: any) => {
          CustomDataSet?.current?.set(mapping.value.name, value);
          handleOk();
        }}
      />
    </div>
  );
});

export default Index;
