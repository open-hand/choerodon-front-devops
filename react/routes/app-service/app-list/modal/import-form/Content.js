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
import PlatForm from './Platform';
import Tips from '../../../../../components/new-tips';
import { useImportAppServiceStore } from './stores';
import SelectCustom from '../../../components/select-custom';

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
    importStore,
    hasMarket,
  } = useImportAppServiceStore();
  const record = useMemo(() => importDs.current || importDs.records[0], [importDs.current]);
  const [hasFailed, setHasFailed] = useState(false);
  useEffect(() => {
    setHasFailed(false);
  }, [record.get('platformType')]);

  modal.handleOk(async () => {
    if (record.get('platformType') === 'share' || record.get('platformType') === 'market') {
      const ds = record.get('platformType') === 'market' ? marketSelectedDs : selectedDs;
      if (!ds.length) return true;
      if (await validateDs() === false) {
        return false;
      }
      const result = await checkData();
      if (!result) {
        return false;
      }
    }
    try {
      if ((await importDs.submit()) !== false) {
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
      validateResult = await selectedDs.validate();
      importStore.setSkipCheck(false);
    }
    return validateResult;
  }

  async function checkData() {
    const ds = record.get('platformType') === 'market' ? marketSelectedDs : selectedDs;
    const lists = ds.toData();
    const {
      listCode, listName, repeatName, repeatCode,
    } = getRepeatData(lists);

    try {
      importStore.setSkipCheck(true);
      const res = await importStore.batchCheck(projectId, listCode, listName);
      validateDs();
      if (res && isEmpty(repeatName) && isEmpty(repeatCode)
        && isEmpty(res.listCode) && isEmpty(res.listName)) {
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
    const nameData = countBy(lists, 'name');
    const codeData = countBy(lists, 'code');
    const listName = keys(nameData);
    const listCode = keys(codeData);
    const repeatName = keys(pickBy(nameData, (value, key) => key && value > 1) || {});
    const repeatCode = keys(pickBy(codeData, (value, key) => key && value > 1) || {});

    return {
      listCode, listName, repeatName, repeatCode,
    };
  }

  function handleOptionProps({ record: optionRecord }) {
    return ({
      disabled: optionRecord.get('value') === 'market' && !hasMarket,
    });
  }

  function handleClick(value) {
    record.set('platformType', value);
  }

  return (
    <div className={`${prefixCls}-import-wrap`}>
      <div className={`${prefixCls}-select-custom-list`}>
        <SelectCustom
          onClickCallback={(value) => handleClick(value)}
          data={IMPORT_METHOD}
          customChildren={(item) => (
            <div className={`${prefixCls}-select-custom-wrap`}>
              <div><img src={item.img} style={{ width: '50px', height: '50px' }} /></div>
              <div>
                <Tooltip title={hasMarket || item.type !== 'market' ? '' : '未安装【应用市场】插件，无法使用此功能'}>
                  <div className={`${prefixCls}-select-custom-title`}>
                    {formatMessage({ id: `${intlPrefix}.import.type.${item.type}` })}
                  </div>
                  <div className={`${prefixCls}-select-custom-tip`}>
                    {formatMessage({ id: `${intlPrefix}.${item.type}.tips` })}
                  </div>
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
        <Form record={record} style={{ width: '3.6rem' }}>
          {record.get('platformType') === 'github'
            ? (
              <SelectBox name="isTemplate">
                <Option value>{formatMessage({ id: `${intlPrefix}.github.system` })}</Option>
                <Option value={false}>{formatMessage({ id: `${intlPrefix}.github.custom` })}</Option>
              </SelectBox>
            )
            : (
              <SelectBox name="isGitLabTemplate">
                <Option value>{formatMessage({ id: `${intlPrefix}.gitlab.simple` })}</Option>
                <Option value={false}>{formatMessage({ id: `${intlPrefix}.gitlab.move` })}</Option>
              </SelectBox>
            )}
          {record.get('platformType') === 'github' && record.get('isTemplate') && (
            <Select name="githubTemplate" searchable />
          )}
          <TextField
            name="repositoryUrl"
            disabled={record.get('platformType') === 'github' && record.get('isTemplate')}
            addonAfter={record.get('platformType') === 'github' && record.get('isTemplate')
              ? null
              : <Tips helpText={formatMessage({ id: `${intlPrefix}.address.${record.get('platformType')}.tips` })} />}
          />
          {record.get('platformType') === 'gitlab' && <TextField name="accessToken" />}
          <Select name="type" clearButton={false} />
          <TextField name="name" />
          <TextField name="code" />
        </Form>
      )}
    </div>
  );
}));

export default ImportForm;
