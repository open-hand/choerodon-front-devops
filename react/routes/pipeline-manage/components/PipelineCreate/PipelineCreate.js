import { axios } from '@choerodon/master';
import React, {
  useEffect, useState,
} from 'react';
import {
  Form, TextField, Select, SelectBox, Button, Modal,
} from 'choerodon-ui/pro';
import { message, Icon, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { usePipelineCreateStore } from './stores';
import Tips from '../../../../components/new-tips';
import CustomFunc from './components/custom-function';
import StageEditBlock from './components/stageEditBlock';
import './pipelineCreate.less';

const { Option } = Select;

const cssPrefix = 'c7ncd-pipelineCreate';

const PipelineCreate = observer(() => {
  const {
    PipelineCreateFormDataSet,
    modal,
    editBlockStore,
    createUseStore,
    AppState: {
      currentMenuType: {
        id,
        projectId,
      },
    },
    refreshTree,
    dataSource,
    mainStore,
    // 老mainData 为了在复制之后 重新设置成以前的mainData
    oldMainData,
    appService,
    isEdit,
  } = usePipelineCreateStore();

  const [expandIf, setExpandIf] = useState(false);

  /**
   * 获取预置模板
   */
  useEffect(() => {
    async function init() {
      const res = await axios.post(`/devops/v1/projects/${projectId}/cicd_pipelines/${dataSource ? dataSource?.id : 0}/functions?include_default=true`);
      createUseStore.setFuncList(res);
    }
    init();
  }, []);

  useEffect(() => {
    if (dataSource) {
      const {
        name, image, versionName,
      } = dataSource;
      let { appServiceId } = dataSource;
      // 如果有appService 说明是复制流水线
      if (appService) {
        appServiceId = appService.id;
        PipelineCreateFormDataSet.getField('appServiceId').props.lookup = [{
          appServiceId,
          appServiceName: appService.name,
        }];
      }
      PipelineCreateFormDataSet.loadData([{
        name,
        appServiceId,
        image,
        selectImage: '1',
        versionName,
        bbcl: !!versionName,
        versionNameRules: '${C7N_COMMIT_TIME}-${C7N_BRANCH}',
      }]);
      // editBlockStore.setStepData(stageList, true);
    }
    const init = async () => {
      const res = await createUseStore.axiosGetDefaultImage();
      createUseStore.setDefaultImage(res);
      if (!dataSource) {
        PipelineCreateFormDataSet.current.set('image', res);
      }
    };
    init();
  }, [PipelineCreateFormDataSet, createUseStore, dataSource]);

  const handleCustomFunc = () => {
    Modal.open({
      key: Modal.key(),
      title: '自定义函数管理',
      drawer: true,
      style: {
        width: '740px',
      },
      children: <CustomFunc useStore={createUseStore} />,
    });
  };

  const handleCreate = async () => {
    const result = await PipelineCreateFormDataSet.validate();
    if (result) {
      const origin = PipelineCreateFormDataSet.toData()[0];
      const data = {
        ...dataSource,
        ...origin,
        image: origin.selectImage === '1' ? origin.image : null,
        devopsCiStageVOS: editBlockStore.getStepData.filter((s) => s.type === 'CI'),
        devopsCdStageVOS: editBlockStore.getStepData.filter((s) => s.type === 'CD'),
        configSettingVOS: editBlockStore.getStepData.map((o) => o.configSettingVOS)[0],
        devopsCiPipelineFunctionDTOList: createUseStore
          .getFuncList.filter((item) => item.devopsPipelineId !== 0),
      };
      if (!data.bbcl) {
        delete data.versionName;
      }
      if (data.devopsCiStageVOS.some((s) => s.jobList.length === 0)
        || data.devopsCdStageVOS.some((s) => s.jobList.length === 0)
      ) {
        message.error(`流水线中存在空阶段，无法${modal.props.title.includes('创建') ? '创建' : '保存'}`);
        return false;
      }
      if (dataSource && !oldMainData) {
        try {
          await axios.put(`/devops/v1/projects/${projectId}/cicd_pipelines/${dataSource.id}`, data);
          editBlockStore.loadData(projectId, dataSource.id);
          refreshTree();
          return true;
        } catch (e) {
          return false;
        }
      }
      try {
        const res = await createUseStore.axiosCreatePipeline(data, id);
        refreshTree();
        modal.close();
        res.id && mainStore.setSelectedMenu({ key: String(res.id) });
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  const handleCancel = () => {
    editBlockStore.setMainData(oldMainData);
  };

  modal.handleOk(handleCreate);

  modal.handleCancel(() => {
    if (oldMainData) {
      handleCancel();
    }
  });

  const handleChangeSelectImage = (data) => {
    if (data === createUseStore.getDefaultImage) {
      PipelineCreateFormDataSet.current.set('selectImage', '0');
    } else {
      PipelineCreateFormDataSet.current.set('selectImage', '1');
    }
  };

  const handleClickMore = async (e) => {
    e.stopPropagation();
    const pageSize = PipelineCreateFormDataSet.current.get('pageSize') + 20;
    const result = await axios.post(`/devops/v1/projects/${projectId}/app_service/page_app_services_without_ci?page=0&size=${pageSize}`);
    if (result.length % 20 === 0) {
      result.push({
        appServiceId: 'more',
        appServiceName: '加载更多',
      });
    }
    PipelineCreateFormDataSet.current.set('pageSize', pageSize);
    PipelineCreateFormDataSet.getField('appServiceId').props.lookup = result;
  };

  const renderer = ({ text }) => {
    const { appServiceName } = createUseStore.getCurrentAppService || {};
    if (dataSource && dataSource.appServiceName) {
      return dataSource.appServiceName;
    }
    return appServiceName || text;
  };

  const optionRenderer = ({ text }) => (text === '加载更多' ? (
    <a
      role="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={handleClickMore}
    >
      {text}
    </a>
  ) : text);

  function getAppServiceData() {
    return createUseStore.getCurrentAppService || {};
  }

  return (
    <div>
      <Form columns={3} dataSet={PipelineCreateFormDataSet}>
        <TextField
          name="name"
          // disabled={dataSource}
        />
        {/* 应用服务只能选择目前没有关联流水线的应用服务 */}
        <Select
          disabled={dataSource}
          name="appServiceId"
          searchable
          searchMatcher="appServiceName"
          addonAfter={<Tips helpText="此处仅能看到您有开发权限的启用状态的应用服务，并要求该应用服务必须有master分支，且尚未有关联的流水线" />}
          optionRenderer={optionRenderer}
          renderer={renderer}
        />
        <TextField style={{ display: 'none' }} />
        <div
          role="none"
          className="advanced_text"
          style={{ cursor: 'pointer' }}
          onClick={() => setExpandIf(!expandIf)}
        >
          高级设置
          <Icon style={{ fontSize: 18 }} type={expandIf ? 'expand_less' : 'expand_more'} />
        </div>
        {
          expandIf ? [
            <Select
              combo
              newLine
              colSpan={2}
              name="image"
              onChange={handleChangeSelectImage}
              addonAfter={<Tips helpText="CI流程Runner镜像是该条流水线中所有CI任务默认的执行环境。您可直接使用此处给出的默认Runner镜像，或是输入自定义的CI流程Runner镜像" />}
            >
              <Option
                value={createUseStore.getDefaultImage}
              >
                {createUseStore.getDefaultImage}
              </Option>
            </Select>,
            <div newLine colSpan={2} style={{ position: 'relative', top: '15px' }}>
              <SelectBox
                name="bbcl"
              >
                <Option value={false}>平台默认</Option>
                <Option value>自定义</Option>
              </SelectBox>
              <Tooltip title={(
                <div>
                  <p style={{ margin: 0 }}>此处版本策略指的是流水线中生成的应用服务版本的名称策略;</p>
                  <p style={{ margin: 0 }}>选择为平台默认后，便会默认使用“时间戳+分支名”的命名规则;</p>
                  <p style={{ margin: 0 }}>若选择为自定义，则支持用户输入一个固定或动态的参数作为版本命名规则</p>
                </div>
              )}
              >
                <Icon
                  type="help"
                  className="c7ncd-select-tips-icon"
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '55px',
                  }}
                />
              </Tooltip>
            </div>,
            PipelineCreateFormDataSet.current.get('bbcl') ? (
              <TextField
                newLine
                colSpan={2}
                addonAfter={(
                  <Tips helpText={[
                    <p style={{ margin: 0 }}>
                      自定义命名规则支持输入固定参数例如：0.1.0，那么之后流水线生成的版本名称，将永远为固定的0.1.0。
                    </p>,
                    <p style={{ margin: 0 }}>
                      {`同时，支持使用动态参数及各种变量，例如：\${CI_PIPELINE_ID}-\${C7N_BRANCH} ，则表示命名规则为：gitlab流水线id+分支名。
更多支持的变量，请参考 `}
                      <a style={{ color: 'cornflowerblue' }} target="_blank" href="https://docs.gitlab.com/ee/ci/variables/predefined_variables.html" rel="noreferrer">GitLab变量</a>
                    </p>,
                  ]}
                  />
)}
                name="versionName"
              />
            ) : (
              <TextField
                newLine
                colSpan={2}
                addonAfter={(
                  <Tips helpText='平台默认的版本命名规则为：${C7N_COMMIT_TIME}-${C7N_BRANCH}，即表示该流水线中生成的版本名称为"时间戳+分支名"' />
                           )}
                name="versionNameRules"
              />
            ),
            <div className={`${cssPrefix}__customFunc`} newLine>
              <p className={`${cssPrefix}__customFunc__title`}>自定义函数</p>
              <Button onClick={handleCustomFunc} style={{ width: '50%' }}>
                自定义函数管理
              </Button>
            </div>,
          ] : ''
        }
      </Form>
      <StageEditBlock
        editBlockStore={editBlockStore}
        edit
        isEdit={isEdit}
        image={PipelineCreateFormDataSet.current.get('image')}
        appServiceId={PipelineCreateFormDataSet.current.get('appServiceId')}
        appServiceCode={
          getAppServiceData()?.appServiceCode || editBlockStore.getMainData?.appServiceCode
        }
        appServiceName={
          getAppServiceData()?.appServiceName || editBlockStore.getMainData?.appServiceName
        }
        appServiceType={getAppServiceData().type || editBlockStore.getMainData?.appServiceType}
        dataSource={dataSource}
      />
      {/* TODO 替换成组件的Alert组件 */}
      <p className="pipeline_createInfo">
        <Icon className="pipeline_createInfo-icon" type="error" />
        此页面定义了CI阶段或其中的任务后，GitLab仓库中的.gitlab-ci.yml文件也会同步修改。
      </p>
    </div>
  );
});

export default PipelineCreate;
