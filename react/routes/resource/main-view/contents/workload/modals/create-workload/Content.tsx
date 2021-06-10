import React, { useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Spin, SelectBox, TextField, Icon, message,
} from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import YamlEditor from '@/components/yamlEditor/YamlEditor';
import classnames from 'classnames';
import { UploadFile } from '@/interface';
import { useCreateWorkloadStore } from './stores';

import './index.less';

const CreateWorkloadContent = observer(() => {
  const {
    formDs,
    prefixCls,
    intlPrefix,
    intl: { formatMessage },
    modal,
    refresh,
    workloadId,
  } = useCreateWorkloadStore();

  const [hasEditorError, setHasEditorError] = useState(false);
  const [fileDisabled, setFileDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const uploadClass = classnames({
    [`${prefixCls}-upload-item`]: true,
    [`${prefixCls}-upload-select`]: !fileDisabled,
    [`${prefixCls}-upload-disabled`]: fileDisabled,
  });

  const record = useMemo(() => formDs.current, [formDs.current]);

  modal.handleOk(async () => {
    const isUpload = record?.get('type') === 'upload';
    if (isUpload) {
      if (errorMessage) {
        return false;
      }
      if (!record?.get('file')) {
        message.error(formatMessage({ id: 'resource.required' }));
        return false;
      }
    } else {
      if (hasEditorError) {
        return false;
      }
      if (!record?.get('value')) {
        message.error(formatMessage({ id: 'contentCanNotBeEmpty' }));
        return false;
      }
    }
    try {
      const res = await formDs.submit();
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
    } catch (e) {
      return false;
    }
    return true;
  });

  const handleTypeChange = useCallback((value) => {
    removeFile();
  }, []);

  const handleChangeValue = useCallback((value) => {
    record?.set('value', value);
  }, [record]);

  const handleEnableNext = useCallback((flag) => {
    setHasEditorError(flag);
  }, []);

  const beforeUpload = (
    file: UploadFile, fileList: UploadFile[],
  ) => {
    setFileDisabled(true);
    const { name: fileName } = file || {};
    if (!fileList.length) {
      setErrorMessage(formatMessage({ id: 'resource.required' }));
    } else if (!fileName.endsWith('.yml') && !fileName.endsWith('.yaml')) {
      setErrorMessage(formatMessage({ id: 'file.type.error' }));
    } else if (fileList.length > 1) {
      setErrorMessage(formatMessage({ id: 'resource.one.file' }));
    } else {
      setErrorMessage('');
      record?.set('file', file);
    }
    return false;
  };

  const removeFile = () => {
    record?.set('file', null);
    setErrorMessage('');
    setFileDisabled(false);
  };

  if (!record) {
    return <Spin />;
  }

  return (
    <div className={prefixCls}>
      {!workloadId ? (
        <Form dataSet={formDs} columns={6}>
          <SelectBox name="type" onChange={handleTypeChange} colSpan={3} />
          <TextField name="envName" disabled colSpan={2} />
        </Form>
      ) : null}
      {record?.get('type') === 'paste' ? (
        // @ts-ignore
        <YamlEditor
          readOnly={false}
          value={record.get('value') || ''}
          originValue={record.getPristineValue('value') || ''}
          onValueChange={handleChangeValue}
          handleEnableNext={handleEnableNext}
        />
      ) : ([
        <Upload
          accept=".yml, .yaml"
          disabled={fileDisabled}
          // @ts-ignore
          beforeUpload={beforeUpload}
          onRemove={removeFile}
          className={`${prefixCls}-upload`}
        >
          <div className={uploadClass}>
            <Icon
              className={`${prefixCls}-upload-icon`}
              type="add"
            />
            <div className={`${prefixCls}-upload-text`}>Upload</div>
          </div>
        </Upload>,
        <div className={`${prefixCls}-upload-error`}>
          <span>{errorMessage}</span>
        </div>,
      ])}
    </div>
  );
});

export default CreateWorkloadContent;
