/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Select } from 'choerodon-ui/pro';
import { Button as OldButton, Icon } from 'choerodon-ui';
import { ChunkUploader } from '@choerodon/components';
import { Base64 } from 'js-base64';
import StatusDot from '@/components/status-dot';
import OperationYaml from '../operation-yaml';
import { useHostOtherProductStore } from './stores';
import { mapping } from './stores/hostOtherProductDataSet';
import { valueCheckValidate } from '../host-app-config/content';

import './index.less';
import '../host-app-config/index.less';

const cssPrefix = 'c7ncd-appCenter-hostOtehrProduct';

export default observer(() => {
  const {
    HostOtherProductDataSet,
    style,
    AppState: {
      currentMenuType: { organizationId },
    },
    cRef,
    configurationCenterDataSet,
    configCompareOptsDS,
  } = useHostOtherProductStore();

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const configCenterFlag = await configurationCenterDataSet.validate();
      if (
        valueCheckValidate(
          HostOtherProductDataSet.current.get(mapping.value.name),
          HostOtherProductDataSet.current.get(mapping.startCommand.name),
          HostOtherProductDataSet.current.get(mapping.postCommand.name),
        ) && configCenterFlag
      ) {
        const flag = await HostOtherProductDataSet.validate();
        if (flag) {
          const data = HostOtherProductDataSet.current.toData();
          const res = {
            ...data,
            fileInfoVO: {
              [mapping.fileName.name as string]: data[mapping.fileName.name as string],
              [mapping.uploadUrl.name as string]: data[mapping.uploadUrl.name as string],
            },
            [mapping.value.name as string]: data[mapping.value.name as string]
              ? Base64.encode(data[mapping.value.name as string])
              : '',
            [mapping.startCommand.name as string]: data[mapping.startCommand.name as string]
              ? Base64.encode(data[mapping.startCommand.name as string])
              : '',
            [mapping.postCommand.name as string]: data[mapping.postCommand.name as string]
              ? Base64.encode(data[mapping.postCommand.name as string])
              : '',
          };
          if (data[mapping.uploadUrl.name as string]) {
            res.sourceType = 'upload';
          }
          return res;
        }
        return false;
      }
      return false;
    },
  }));

  const renderHostOption = ({ record, text }: any) => (
    <>
      <StatusDot
        // @ts-ignore
        size="small"
        synchronize
        connect={record.get('connect')}
      />
      {text}
    </>
  );

  return (
    <div style={style || {}} className={cssPrefix}>
      {/* <Form
        dataSet={HostOtherProductDataSet}
        columns={3}
      >
        <Select
          name={mapping.host.name}
          optionRenderer={renderHostOption}
          onOption={({ record: hostRecord }) => ({
            disabled: !hostRecord.get('connect'),
          })}
        />
      </Form> */}
      <div style={{ width: '33.3%' }}>
        <ChunkUploader
          callbackWhenLoadingChange={(loadingIf: boolean) => {
            // console.log(loadingIf);
            // modal.update({
            //   okProps: {
            //     disabled: loadingIf,
            //   },
            // });
          }}
          // eslint-disable-next-line
          combineUrl={`${window._env_.API_HOST}/hfle/v1/${organizationId}/upload/fragment-combine`}
          // disabled={!ImportFileDataSet?.current?.get(mapping().folderId.name)}
          // suffix=".jar"
          paramsData={{
            bucketName: 'devops-service',
          }}
          // accept=".jar"
          prefixPatch="/hfle"
          showUploadList
          onSuccess={(res: any, file: any) => {
            HostOtherProductDataSet.current.set(mapping.fileName.name, file.name);
          }}
          callback={(str: string) => {
            HostOtherProductDataSet.current.set(mapping.uploadUrl.name, str);
          }}
        >
          <OldButton type="dashed" icon="file_upload_black-o">
            上传文件
          </OldButton>
        </ChunkUploader>
        {HostOtherProductDataSet.current.get(mapping.uploadUrl.name) && (
          <p
            // @ts-ignore
            newLine
            className="c7ncd-appCenterPro-conDetail__fileName"
            style={{
              width: '100%',
              marginTop: 20,
            }}
          >
            <span className="c7ncd-appCenterPro-conDetail__fileName__fileIcon">
              <Icon type="attach_file" />
              <span>{HostOtherProductDataSet.current.get(mapping.fileName.name)}</span>
            </span>
            <Icon
              onClick={() => {
                HostOtherProductDataSet.current.set(mapping.fileName.name, '');
                HostOtherProductDataSet.current.set(mapping.uploadUrl.name, '');
              }}
              type="delete"
              style={{
                cursor: 'pointer',
                color: '#5365EA',
              }}
            />
          </p>
        )}
      </div>
      <OperationYaml
        style={{
          marginTop: 30,
        }}
        dataSet={HostOtherProductDataSet}
        configDataSet={configurationCenterDataSet}
        optsDS={configCompareOptsDS}
        preName={mapping.value.name as string}
        startName={mapping.startCommand.name as string}
        postName={mapping.postCommand.name as string}
      />
    </div>
  );
});
