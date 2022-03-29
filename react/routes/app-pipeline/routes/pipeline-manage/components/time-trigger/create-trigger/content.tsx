import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  axios,
  Choerodon,
  ciPipelineSchedulesApi,
} from '@choerodon/master';
import {
  Form,
  TextField,
  Select,
  SelectBox,
  DatePicker,
} from 'choerodon-ui/pro';
import concat from 'lodash/concat';
import {
  Button,
} from 'choerodon-ui';
import {
  NewTips,
  CustomSelect,
} from '@choerodon/components';
import { map, some, debounce } from 'lodash';
import { handlePromptError } from '@/utils';
import {
  useCreateTriggerStore,
} from './stores';
import {
  mapping,
  triggerWayData,
  transformSubmitData,
  transformLoadData,
} from './stores/createTriggerDataSet';
import {
  mapping as variableMapping,
} from './stores/variableDataSet';

import './index.less';

const cssPrefix = 'c7ncd-createTrigger';

const { OptGroup, Option } = Select;

const Index = observer(() => {
  const {
    CreateTriggerDataSet,
    VariableDataSet,
    appServiceId,
    AppState: { currentMenuType: { projectId } },
    modal,
    refresh,
    data,
  } = useCreateTriggerStore();

  const [branchData, setBranchData] = useState<any>([]);
  const [hasMoreBranch, setHasMoreBranch] = useState<any>(false);
  const [tagData, setTagData] = useState<any>([]);
  const [hasMoreTag, setHasMoreTag] = useState<any>(false);

  const handleOk = async () => {
    const flag = await CreateTriggerDataSet?.current?.validate();
    const variableFlag = await VariableDataSet?.validate();
    if (flag && variableFlag) {
      const transData = {
        appServiceId,
        variableVOList: JSON.stringify(VariableDataSet?.toData()) === '[{}]' ? [] : VariableDataSet?.toData(),
        ...transformSubmitData(CreateTriggerDataSet),
      };
      try {
        if (data) {
          await ciPipelineSchedulesApi.editPlan({
            id: data?.id,
            data: {
              objectVersionNumber: data?.objectVersionNumber,
              ...transData,
            },
          });
        } else {
          await ciPipelineSchedulesApi.createPlan({ data: transData });
        }
        refresh && refresh();
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
    return false;
  };

  if (modal) {
    modal.handleOk(handleOk);
  }

  const initBranchData = async ({
    searchValue,
    id,
    page = 1,
  }: any) => {
    try {
      const postData = { searchParam: { branchName: searchValue }, param: [] };
      const res = await axios.post(`devops/v1/projects/${projectId}/app_service/${id}/git/page_branch_basic_info_by_options?page=${page}&size=5`, postData);
      if (handlePromptError(res)) {
        if (res.pageNum === 1) {
          setBranchData(res.list);
        } else {
          setBranchData(concat(branchData.slice(), res.list));
        }
        setHasMoreBranch(res.hasNextPage);
        return res;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const initTagData = async ({
    searchValue,
    page = 1,
    id,
  }: any) => {
    try {
      const postData = { searchParam: { tagName: searchValue }, param: [] };
      const res = await axios.post(`devops/v1/projects/${projectId}/app_service/${id}/git/page_tags_by_options?page=${page}&size=5`, postData);
      if (handlePromptError(res)) {
        if (res.pageNum === 1) {
          setTagData(res.list);
        } else {
          setTagData(concat(branchData.slice(), res.list));
        }
        setHasMoreTag(res.hasNextPage);
        return res;
      }
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  };

  const initData = () => {
    if (data) {
      CreateTriggerDataSet.loadData([transformLoadData(data)]);
      VariableDataSet.loadData(data?.variableVOList || []);
    }
  };

  useEffect(() => {
    initBranchData({ id: appServiceId });
    initTagData({ id: appServiceId });
    initData();
  }, []);

  const renderVariable = () => (
    <>
      {VariableDataSet.map((record: any) => (
        <Form record={record} columns={24}>
          <TextField colSpan={10} name={variableMapping.name.name} />
          <span
        // @ts-ignore
            colSpan={2}
            style={{
              position: 'relative',
              top: '15px',
            }}
          >
            =
          </span>
          <TextField colSpan={10} name={variableMapping.value.name} />
          {/* @ts-ignore */}
          {
        VariableDataSet.length > 1 && (
        <Button
          funcType="flat"
          icon="delete_black-o"
        // @ts-ignore
          colSpan={2}
          onClick={() => {
            VariableDataSet.delete([record], false);
          }}
          style={{
            position: 'relative',
            top: '9px',
            left: '-12px',
          }}
        />
        )
      }
        </Form>
      ))}
      <Button
        style={{
          marginBottom: 18,
        }}
        funcType="flat"
        icon="add"
        onClick={() => {
          VariableDataSet.create();
        }}
      >
        添加变量
      </Button>
    </>
  );

  return (
    <>
      <Form dataSet={CreateTriggerDataSet}>
        <TextField name={mapping.planName.name} />
        <Select name={mapping.branch.name}>
          <OptGroup
            label="分支"
            key="proGroup"
          >
            {map(branchData, ({ branchName }: any) => (
              <Option value={`${branchName}`} key={branchName} title={branchName}>
                {branchName}
              </Option>
            ))}
            {hasMoreBranch ? (
              <Option value="branch" />
            ) : null}
          </OptGroup>
          <OptGroup
            label="Tag"
            key="more"
          >
            {map(tagData, ({ release }: any) => (release
              ? (
                <Option value={`${release.tagName}`} key={release.tagName}>
                  {release.tagName}
                </Option>
              ) : null))}
            {hasMoreTag ? (
              <Option value="tag" />) : null }
          </OptGroup>
        </Select>
      </Form>
      <p className={`${cssPrefix}-config ${cssPrefix}-title`}>
        执行变量配置
        <NewTips helpText="" />
      </p>
      {renderVariable()}
      <p className={`${cssPrefix}-title`}>
        定时触发方式
      </p>
      <div className={`${cssPrefix}-customSelect`}>
        <CustomSelect
          onClickCallback={(value) => {
            CreateTriggerDataSet?.current?.set(mapping.triggerWay.name, value.value);
          }}
          selectedKeys={CreateTriggerDataSet?.current?.get(mapping.triggerWay.name)}
          data={triggerWayData}
          identity="value"
          mode="single"
          customChildren={(item) => (
            <div className={`${cssPrefix}-customSelect-item`}>
              <p>{item.name}</p>
            </div>
          )}
        />
      </div>
      <Form columns={2} dataSet={CreateTriggerDataSet}>
        <SelectBox colSpan={2} name={mapping.datePick.name} />
        {
          CreateTriggerDataSet?.current?.get(mapping.triggerWay.name)
          === triggerWayData[0].value ? (
            <>
              <DatePicker
                mode={'time' as any}
                colSpan={1}
                name={mapping.timePeriod.name}
              />
              <Select colSpan={1} name={mapping.timeInterval.name} />
            </>
            ) : (
              <DatePicker
                mode={'time' as any}
                colSpan={2}
                name={mapping.executeTime.name}
              />
            )
        }
      </Form>
    </>

  );
});

export default Index;
