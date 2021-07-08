import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select,
} from 'choerodon-ui/pro';
import { useDeleteRelatedStore } from './stores';

const DeleteRelated = () => {
  const {
    formDs,
    refresh,
    modal,
  } = useDeleteRelatedStore();

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

  return (
    <Form dataSet={formDs}>
      <Select
        name="envId"
        searchable
        clearButton={false}
      />
    </Form>
  );
};

export default observer(DeleteRelated);
