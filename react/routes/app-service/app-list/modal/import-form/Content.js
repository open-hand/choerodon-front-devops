/* eslint-disable max-len */
import React, {
  Fragment, useState, useEffect, useMemo,
} from 'react';
import {
  Form, TextField, Select, SelectBox, Tooltip,
} from 'choerodon-ui/pro';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/boot';
import keys from 'lodash/keys';
import countBy from 'lodash/countBy';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import { NewTips, CustomSelect } from '@choerodon/components';
import PlatForm from './Platform';
import Tips from '../../../../../components/new-tips';
import { useImportAppServiceStore } from './stores';

const { Option } = Select;

const ImportForm = injectIntl(observer((props) => {
  const {
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    intlPrefix,
    prefixCls,
    IMPORT_METHOD,
    refresh,
    modal,
    importDs,
    selectedDs,
    marketSelectedDs,
    gitlabSelectedDs,
    importStore,
    hasMarket,
  } = useImportAppServiceStore();
  const record = useMemo(() => importDs.current || importDs.records[0], [importDs.current]);
  const [hasFailed, setHasFailed] = useState(false);
  useEffect(() => {
    setHasFailed(false);
  }, [record.get('platformType')]);

  const selectedDataSet = { market: marketSelectedDs, share: selectedDs, gitlab: gitlabSelectedDs };
  modal.handleOk(async () => {
    if (record.get('platformType') === 'share' || record.get('platformType') === 'market' || (record.get('platformType') === 'gitlab' && !record.get('isGitLabTemplate'))) {
      const ds = selectedDataSet[record.get('platformType')];
      if (!ds.length) return true;
      if (!await validateDs()) {
        return false;
      }
      const result = await checkData();
      if (!result) {
        return false;
      }
    }
    try {
      const res = await importDs.submit();
      if (res) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  });

  async function validateDs() {
    let validateResult = false;
    // 因为市场服务应用通过ds.loadData方法添加，调用ds.validate不会触发每条record的校验
    if (record.get('platformType') === 'market') {
      const results = await Promise.all(
        marketSelectedDs.map((eachRecord) => eachRecord.validate(true)),
      );
      validateResult = results.every((result) => result);
    } else {
      validateResult = await selectedDataSet[record.get('platformType')].validate();
      importStore.setSkipCheck(false);
    }
    return validateResult;
  }

  async function checkData() {
    const ds = selectedDataSet[record.get('platformType')];
    const lists = ds.toData();
    const {
      listCode, listName, repeatName, repeatCode,
    } = getRepeatData(lists);
    try {
      importStore.setSkipCheck(true);
      const res = await importStore.batchCheck(projectId, listCode, listName);
      validateDs();
      if ((res && isEmpty(repeatName) && isEmpty(repeatCode)
        && isEmpty(res.listCode) && isEmpty(res.listName)) || (res && listName[0] === 'undefined')) {
        setHasFailed(false);
        return true;
      }
      setHasFailed(true);
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }

  function getRepeatData(lists) {
    let nameData;
    let codeData;
    if (record.get('platformType') === 'gitlab') {
      nameData = countBy(lists, 'servername');
      codeData = countBy(lists, 'name');
    } else {
      nameData = countBy(lists, 'name');
      codeData = countBy(lists, 'code');
    }
    const listName = keys(nameData);
    const listCode = keys(codeData);
    const repeatName = keys(pickBy(nameData, (value, key) => key && value > 1) || {});
    const repeatCode = keys(pickBy(codeData, (value, key) => key && value > 1) || {});
    return {
      listCode, listName, repeatName, repeatCode,
    };
  }

  function handleClick(value) {
    record.set('platformType', value.type);
  }

  function renderGitlabTemplate() {
    return (
      <div className={`${prefixCls}-option-child`}>
        {formatMessage({ id: `${intlPrefix}.import.type` })}
      </div>
    );
  }

  function handleClick(value) {
    record.set('platformType', value);
  }

  return (
    <div className={`${prefixCls}-import-wrap`}>
      <div className={`${prefixCls}-select-custom-list`}>
<<<<<<< HEAD
        <CustomSelect
=======
        <SelectCustom
>>>>>>> 241d8975d (给select-custom组件增加ts类型限制)
          onClickCallback={(value) => handleClick(value)}
          data={IMPORT_METHOD}
          identity="type"
          mode="single"
          customChildren={(item) => (
            <div
              className={`${prefixCls}-select-custom-wrap`}
            >
              <div><img src={item.img} style={{ width: '50px', height: '50px' }} /></div>
              <div style={{ padding: '5px' }}>
                <Tooltip title={hasMarket || item.type !== 'market' ? '' : '未安装【应用市场】插件，无法使用此功能'}>
                  <div className={`${prefixCls}-select-custom-title`}>
                    {formatMessage({ id: `${intlPrefix}.import.type.${item.type}` })}
                  </div>
                  <Tooltip title={formatMessage({ id: `${intlPrefix}.${item.type}.tips` })}>
                    <div className={`${prefixCls}-select-custom-tip`}>
                      {formatMessage({ id: `${intlPrefix}.${item.type}.tips` })}
                    </div>
                  </Tooltip>
                </Tooltip>
              </div>
            </div>
          )}
        />
      </div>
      {record.get('platformType') === 'share' || record.get('platformType') === 'market' ? (
        <>
          <PlatForm checkData={checkData} />
          {hasFailed && (
            <span className={`${prefixCls}-import-wrap-failed`}>
              {formatMessage({ id: `${intlPrefix}.platform.failed` })}
            </span>
          )}
        </>
      ) : (
        <Form record={record}>
          {record.get('platformType') === 'github'
            ? (
              <SelectBox name="isTemplate">
                <Option value>{formatMessage({ id: `${intlPrefix}.github.system` })}</Option>
                <Option value={false}>{formatMessage({ id: `${intlPrefix}.github.custom` })}</Option>
              </SelectBox>
            )
            : (
              <div style={{ display: 'flex', height: '50px' }}>
                <SelectBox name="isGitLabTemplate" label={renderGitlabTemplate()}>
                  <Option value>
                    <div className={`${prefixCls}-option-child`}>
                      {formatMessage({ id: `${intlPrefix}.gitlab.simple` })}
                      <div className={`${prefixCls}-newtips`}><NewTips showHelp helpText="选择后，将对目标仓库执行克隆操作，以此来生成新的应用服务" /></div>
                    </div>
                  </Option>
                  <Option value={false}>
                    <div className={`${prefixCls}-option-child`}>
                      {formatMessage({ id: `${intlPrefix}.gitlab.move` })}
                      <div className={`${prefixCls}-newtips`}><NewTips showHelp helpText="此操作将用于从【未与Choerodon猪齿鱼项目关联】的GitLab Group中批量迁移代码仓库至当前项目。注意：成功迁移后，原代码仓库将从原来的Group中消失" /></div>
                    </div>
                  </Option>
                </SelectBox>
                <div style={{ width: '40%' }}>
                  <Select
                    onOption={(param) => ({
                      disabled: param.record.data.bindFlag,
                    })}
                    addonAfter={<Tips helpText="此处支持模糊搜索；您需要输入目标Group的名称来进行搜索。此处仅能选中当前用户拥有Owner权限且【未与Choerodon猪齿鱼项目关联】的Group。" />}
                    name="gitlabTemplate"
                    searchable
                    searchMatcher="params"
                    optionRenderer={({ record: current, text, value }) => (
                      <Tooltip title={current.get('bindFlag') ? '该Group已经存在关联的Choerodon项目，无法执行迁移操作' : ''}>
                        `$
                        {text}
                        ($
                        {current.get('path')}
                        )`
                      </Tooltip>
                    )}
                  />
                </div>
              </div>
            )}
          {(record.get('platformType') === 'gitlab' && !record.get('isGitLabTemplate')) && <PlatForm checkData={checkData} />}
          <Form columns={3}>
            {record.get('platformType') === 'github' && record.get('isTemplate') && (
            <Select name="githubTemplate" searchable colSpan={1} />
            )}
            {(record.get('platformType') === 'github' || record.get('isGitLabTemplate')) && (
            <TextField
              colSpan={1}
              name="repositoryUrl"
              disabled={(record.get('platformType') === 'github') && record.get('isTemplate')}
              addonAfter={record.get('platformType') === 'github' && record.get('isTemplate')
                ? null
                : <Tips helpText={formatMessage({ id: `${intlPrefix}.address.${record.get('platformType')}.tips` })} />}
            />
            )}
            {(record.get('platformType') === 'gitlab' && record.get('isGitLabTemplate')) && <TextField name="accessToken" colSpan={1} />}
            {(record.get('isGitLabTemplate') || record.get('platformType') === 'github') && (
            <>
              {((record.get('platformType') === 'github') && !record.get('isTemplate')) ? <Select name="type" clearButton={false} colSpan={1} /> : <Select name="type" clearButton={false} colSpan={1} newLine />}
              {((record.get('platformType') === 'github') && !record.get('isTemplate')) ? <TextField name="name" colSpan={1} newLine /> : <TextField name="name" />}
              <TextField name="code" colSpan={1} />
            </>
            )}
            {hasFailed && (
            <span className={`${prefixCls}-import-wrap-failed`}>
              {formatMessage({ id: `${intlPrefix}.platform.failed` })}
            </span>
            )}
          </Form>
        </Form>
      )}
    </div>
  );
}));

export default ImportForm;
