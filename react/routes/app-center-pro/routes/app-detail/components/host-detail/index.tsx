import React, { useEffect, useRef } from 'react';
import { Form, DataSet, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router';
import { TimePopover } from '@choerodon/components';
import EnvOrHostStatusIcon from '@/routes/app-center-pro/components/EnvOrHostStatusIcon';
import AppStatus from '@/routes/app-center-pro/components/AppStatus';
import { useAppDetailsStore } from '@/routes/app-center-pro/routes/app-detail/stores';
import { getChartSourceName } from '@/routes/app-center-pro/routes/app-detail/components/detail-side';
import DetailsTabsHeaderButtons
  from '@/routes/app-center-pro/routes/app-detail/components/detail-tabs/components/HeaderButtons';
import {
  OTHER_CATEGORY,
  DOCKER_CATEGORY,
  CUSTOM_TYPE,
} from '@/routes/app-center-pro/routes/app-detail/CONSTANT';

import './index.less';
import { ENV_TAB, JAR_CUSTOM } from '@/routes/app-center-pro/stores/CONST';
import get = Reflect.get;

const cssPrefix = 'c7ncd-applicationCenter-hostDetail';

const getReady = (
  value: string,
  record: any,
  type: string,
) => {
  if (type === 'color') {
    if (record.get('healthProbExist')) {
      return value === 'true' ? 'blue-inverse' : 'gold-inverse';
    }
    return 'gray-inverse';
  }
  if (record.get('healthProbExist')) {
    return value === 'true' ? '已就绪' : '未就绪';
  }
  return '未设置探针';
};

const Index = observer(({
  data,
}: {
  data: any
}) => {
  const {
    appCatergory,
  } = useAppDetailsStore();

  const ref = useRef<any>(new DataSet({
    data: [{
      ...data,
      createRealName: data?.creator?.realName,
      updateRealName: data?.updater?.realName,
      appCatergory: appCatergory?.name,
      fileName: data?.fileInfoVO?.fileName,
      image: data?.devopsDockerInstanceVO?.image,
      containerName: data?.devopsDockerInstanceVO?.name,
      repoType: data?.devopsDockerInstanceVO?.repoType,
      downloadUrl: data?.jarPullInfoDTO?.downloadUrl,
    }],
    fields: [{
      name: 'code',
      label: '应用编码',
      type: 'string' as any,
    }, {
      name: 'hostName',
      label: '主机',
      type: 'string' as any,
    }, {
      name: 'deployWay',
      label: '部署方式',
      type: 'string' as any,
    }, {
      name: 'appCatergory',
      label: '部署对象',
      type: 'string' as any,
    }, {
      name: 'ready',
      label: '应用状态',
      type: 'string' as any,
    }, {
      name: 'sourceType',
      label: appCatergory?.code === OTHER_CATEGORY ? '应用来源' : 'jar包来源',
      type: 'string' as any,
    }, {
      name: 'groupId',
      label: 'groupId',
      type: 'string' as any,
    }, {
      name: 'artifactId',
      label: 'artifactId',
      type: 'string' as any,
    }, {
      name: 'creationDate',
      label: '创建时间',
      type: 'string' as any,
    }, {
      name: 'createRealName',
      label: '创建者',
      type: 'string' as any,
    }, {
      name: 'lastUpdateDate',
      label: '最近更新时间',
      type: 'string' as any,
    }, {
      name: 'fileName',
      label: '文件名',
      type: 'string' as any,
    }, {
      name: 'updateRealName',
      label: '最近更新者',
      type: 'string' as any,
    }, {
      name: 'repoName',
      label: '所属镜像仓库',
      type: 'string' as any,
    }, {
      name: 'image',
      label: '镜像',
      type: 'string' as any,
    }, {
      name: 'version',
      label: '镜像版本',
      type: 'string' as any,
    }, {
      name: 'containerName',
      label: '容器名称',
      type: 'string' as any,
    }, {
      name: 'hostName',
      label: '所属主机',
      type: 'string' as any,
    }, {
      name: 'status',
      label: '状态',
      type: 'string' as any,
    }, {
      name: 'ports',
      label: '占用端口',
      type: 'string' as any,
    }, {
      name: 'downloadUrl',
      label: 'jar包地址',
      type: 'string' as any,
    }],
  }));

  // useEffect(() => {
  //   ref.current = new DataSet({
  //     data: [{
  //       code: 'wx',
  //     }],
  //     fields: [{
  //       name: 'code',
  //       label: '应用编码',
  //     }],
  //   });
  // }, [data]);

  const {
    podRunningCount,
    podCount,
    name,
    error,
    devopsHostCommandDTO,
    objectStatus,
    ready,
  } = data;

  const params = useParams<any>();

  const {
    deployType,
  } = params;

  const isEnv = deployType === ENV_TAB;

  return (
    <div className={cssPrefix}>
      <DetailsTabsHeaderButtons />
      <div className={`${cssPrefix}__title`}>
        <EnvOrHostStatusIcon
          podRunningCount={podRunningCount}
          podCount={podCount}
          currentType={deployType}
        />
        <p className={`${cssPrefix}__title__name`}>{ name }</p>
        <AppStatus
          error={error || devopsHostCommandDTO?.error}
          status={isEnv ? objectStatus : devopsHostCommandDTO?.status}
          deloyType={deployType}
        />
      </div>
      <div className={`${cssPrefix}__wrap`}>
        <div
          className={`${cssPrefix}__content`}
          style={{
            width: '60%',
          }}
        >
          <p className={`${cssPrefix}__content__name`}>基本信息</p>
          <Form
            columns={2}
            dataSet={ref?.current}
            labelLayout={'horizontal' as any}
            labelAlign={'left' as any}
          >
            <Output name="code" />
            <Output
              name="creationDate"
              renderer={({ value }) => (
                <TimePopover
                  content={value}
                />
              )}
            />
            <Output name="hostName" />
            <Output name="createRealName" />
            <Output name="deployWay" />
            <Output
              name="lastUpdateDate"
              renderer={({ value }) => (
                <TimePopover
                  content={value}
                />
              )}
            />
            {
              appCatergory?.code === DOCKER_CATEGORY ? (
                <Output
                  name="repoName"
                  renderer={({ record }) => (
                    record?.get('repoType') === CUSTOM_TYPE ? record?.get('image') : (
                      record?.get('image')?.split(':')[0]?.split('/')[1]
                    )
                  )}
                />
              ) : (
                <Output name="appCatergory" />
              )
            }
            <Output name="updateRealName" />
            {
              appCatergory?.code === DOCKER_CATEGORY ? (
                <Output
                  name="image"
                  renderer={({ record }) => record?.get('image')?.split(':')[0]?.split('/')[2] || '-'}
                />
              ) : (
                <Output
                  newLine
                  name="ready"
                  renderer={({ value, record }) => (
                    <Tag
                      color={getReady(value, record, 'color')}
                    >
                      {getReady(value, record, 'text')}
                    </Tag>
                  )}
                />
              )
            }
            {
              appCatergory?.code === DOCKER_CATEGORY ? (
                <Output
                  name="version"
                  newLine
                  renderer={({ record }) => record?.get('image')?.split(':')[1] || '-'}
                />
              ) : (
                <>
                  <Output
                    newLine
                    name="sourceType"
                    renderer={({ value }) => getChartSourceName[value]}
                  />
                  {
                    (function () {
                      // eslint-disable-next-line no-nested-ternary
                      return data?.sourceType === JAR_CUSTOM ? (
                        <>
                          <Output
                            name="downloadUrl"
                            newLine
                          />
                        </>
                      )
                        : (appCatergory?.code === OTHER_CATEGORY ? (
                          <Output
                            name="fileName"
                            newLine
                          />
                        ) : (
                          <>
                            <Output
                              newLine
                              name="groupId"
                            />
                            <Output
                              newLine
                              name="artifactId"
                            />
                          </>
                        ));
                    }())
                  }
                </>
              )
            }
          </Form>
        </div>
        {
          appCatergory?.code === DOCKER_CATEGORY && (
            <div
              className={`${cssPrefix}__content`}
              style={{
                marginLeft: 0,
                paddingLeft: 0,
                flex: 1,
                marginRight: '15.6%',
              }}
            >
              <p className={`${cssPrefix}__content__name`}>运行详情</p>
              <Form
                columns={1}
                dataSet={ref?.current}
                labelLayout={'horizontal' as any}
                labelAlign={'left' as any}
              >
                <Output name="containerName" />
                <Output name="hostName" />
                <Output
                  name="status"
                  renderer={({ value }) => value || '-'}
                />
                <Output
                  name="ports"
                  renderer={({ value }) => value || '-'}
                />
              </Form>
            </div>
          )
        }
      </div>
    </div>
  );
});

export default Index;

export {
  getReady,
};
