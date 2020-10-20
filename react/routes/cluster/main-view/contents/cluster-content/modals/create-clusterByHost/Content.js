import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, TextArea, Form, Modal,
} from 'choerodon-ui/pro';
import { useFormStore } from './stores';
import ActivateCluster from '../activate-cluster';
import NodesCreate from '../create-nodes';

const modalStyle = {
  width: 380,
};
function CreateClusterHostForm() {
  const ActivateClusterModalKey = Modal.key();
  const {
    modal,
    formDs,
    // mainStore,
    // afterOk,
    formatMessage,
    intlPrefix,
    isEdit,
    prefixCls,
  } = useFormStore();

  const openActivate = (cmd) => {
    Modal.open({
      key: ActivateClusterModalKey,
      title: formatMessage({ id: `${intlPrefix}.activate.header` }),
      children: <ActivateCluster cmd={cmd} intlPrefix={intlPrefix} formatMessage={formatMessage} />,
      drawer: true,
      style: modalStyle,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  };
  // if (isEdit) {
  //   formDs.query();
  // }

  async function handleSubmit() {
    // try {
    //   if ((await formDs.submit()) !== false) {
    //     if (!isEdit) {
    //       const dataObj = JSON.parse(JSON.stringify(mainStore));
    //       openActivate(dataObj.responseData);
    //     }
    //     afterOk();
    //     return true;
    //   }
    //   return false;
    // } catch (e) {
    //   return false;
    // }
  }

  modal.handleOk(handleSubmit);
  return (
    <div className={`${prefixCls}-createByHost`}>
      <Form
        dataSet={formDs}
        columns={6}
      >
        <TextField name="name" colSpan={2} />
        <TextField name="code" disabled={isEdit} colSpan={2} />
        <TextArea name="description" resize="vertical" colSpan={2} />
      </Form>
      <NodesCreate
        prefixCls={prefixCls}
        formatMessage={formatMessage}
        intlPrefix={intlPrefix}
      />
    </div>
  );
}

export default observer(CreateClusterHostForm);
