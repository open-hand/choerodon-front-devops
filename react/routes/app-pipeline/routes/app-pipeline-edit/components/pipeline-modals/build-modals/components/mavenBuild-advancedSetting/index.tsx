import React from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from 'choerodon-ui';
import {
  Button, Form, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import {
  YamlEditor,
} from '@choerodon/components';
import {
  mapping as StepMapping,
  settingConfigOptionsData,
} from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/stepDataSet';
import {
  mapping as repoConfigMapping,
  typeData,
} from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/customRepoConfigDataSet';

const Index = observer(({
  prefix,
  record,
}: any) => {
  const handleAddSettingRepo = (typeValue: any, inrecord: any) => {
    inrecord.getField(StepMapping.customRepoConfig.name).options.create({
      [repoConfigMapping.type.name]: typeValue,
    });
  };

  return (
    <>
      {/* @ts-ignore */}
      <div colSpan={2} className={`${prefix}__stepItem__main__mavenAdvanced`}>
        <Icon
          type="navigate_next"
          onClick={() => {
            record.set(
              StepMapping.advancedExpand.name,
              !record.get(StepMapping.advancedExpand.name),
            );
          }}
        />
        <p>高级设置</p>
      </div>
      {
        record.get(StepMapping.advancedExpand.name) && (
          //  @ts-ignore
          <div colSpan={2}>
            <Form columns={2} record={record}>
              <SelectBox colSpan={2} name={StepMapping.settingConfig.name} />
            </Form>
            {
              record.get(StepMapping.settingConfig.name) === settingConfigOptionsData[0].value
                ? (
                  <>
                    {
                      record.getField(StepMapping.customRepoConfig.name).options
                        .filter((optionsRecord: any) => optionsRecord
                          .get(repoConfigMapping.type.name) === typeData[0].value)
                        .filter((optionsRecord: any) => optionsRecord.status !== 'delete')
                        .map((optionsRecord: any) => (
                          <Form columns={2} record={optionsRecord}>
                            <TextField name={repoConfigMapping.repoName.name} />
                            <Select name={repoConfigMapping.repoType.name} />
                            <TextField name={repoConfigMapping.repoAddress.name} />
                            <Button
                              icon="delete"
                              onClick={() => {
                                record
                                  .getField(StepMapping.customRepoConfig.name)
                                  .options.delete(optionsRecord, false);
                              }}
                            />
                          </Form>
                        ))
                    }
                    <Button
                      onClick={() => handleAddSettingRepo(typeData[0].value, record)}
                      icon="add"
                      style={{
                        marginBottom: 10,
                      }}
                    >
                      添加公有依赖仓库
                    </Button>
                    {
                      record.getField(StepMapping.customRepoConfig.name).options
                        .filter((optionsRecord: any) => optionsRecord
                          .get(repoConfigMapping.type.name) === typeData[1].value)
                        .filter((optionsRecord: any) => optionsRecord.status !== 'delete')
                        .map((optionsRecord: any) => (
                          <Form columns={2} record={optionsRecord}>
                            <TextField name={repoConfigMapping.repoName.name} />
                            <Select name={repoConfigMapping.repoType.name} />
                            <TextField name={repoConfigMapping.username.name} />
                            <TextField name={repoConfigMapping.password.name} />
                            <TextField name={repoConfigMapping.repoAddress.name} />
                            <Button
                              icon="delete"
                              onClick={() => {
                                record
                                  .getField(StepMapping.customRepoConfig.name)
                                  .options.delete(optionsRecord, false);
                              }}
                            />
                          </Form>
                        ))
                    }
                    <Button
                      onClick={() => handleAddSettingRepo(typeData[1].value, record)}
                      icon="add"
                      style={{
                        display: 'block',
                        marginLeft: 0,
                        marginTop: 10,
                      }}
                    >
                      添加私有依赖仓库
                    </Button>
                  </>
                ) : (
                  <YamlEditor
                    modeChange={false}
                    readOnly={false}
                    value={record.get(StepMapping.advancedXml.name)}
                    onValueChange={(value: string) => {
                      record.set(StepMapping.advancedXml.name, value);
                    }}
                  />
                )
            }
          </div>
        )
      }
    </>
  );
});

export default Index;
