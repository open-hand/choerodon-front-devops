import React, { Fragment, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { SelectBox, Select, Form } from 'choerodon-ui/pro';
import { UserInfo } from '@choerodon/components';
import { handlePromptError } from '../../../../../../../utils';
import DynamicSelect from '../../../../../../../components/dynamic-select-new';

const { Option } = Select;

export default observer((props) => {
  const {
    dataSet, nonePermissionDs, refresh, baseDs, store, projectId, formatMessage, intlPrefix, modal,
  } = props;

  const record = useMemo(() => baseDs.current, [baseDs.current]);

  modal.handleOk(async () => {
    const skipCheckPermission = record.get('skipCheckPermission');
    const baseData = {
      envId: record.get('id'),
      objectVersionNumber: record.get('objectVersionNumber'),
      skipCheckPermission,
    };
    if (skipCheckPermission) {
      const res = await store.addUsers({
        projectId,
        userIds: [],
        ...baseData,
      });
      if (handlePromptError(res, false)) {
        refresh();
        return true;
      }
      return false;
    }
    dataSet.transport.create = ({ data }) => {
      const res = {
        userIds: map(data, 'iamUserId'),
        ...baseData,
      };
      return {
        url: `/devops/v1/projects/${projectId}/envs/${record.get('id')}/permission`,
        method: 'post',
        data: res,
      };
    };
    try {
      if (await dataSet.submit() !== false) {
        refresh();
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  });

  modal.handleCancel(() => {
    record.reset();
    dataSet.reset();
  });

  const renderUserOption = ({ record: optionRecord }) => <UserInfo realName={optionRecord.get('realName') || ''} loginName={record.get('loginName')} />;

  const renderer = ({ optionRecord }) => <UserInfo realName={optionRecord.get('realName') || ''} loginName={record.get('loginName')} />;

  return (
    <>
      <Form record={record}>
        <SelectBox name="skipCheckPermission">
          <Option value>{formatMessage({ id: `${intlPrefix}.member.all` })}</Option>
          <Option value={false}>{formatMessage({ id: `${intlPrefix}.member.specific` })}</Option>
        </SelectBox>
      </Form>
      {record && !record.get('skipCheckPermission') && (
        <DynamicSelect
          selectDataSet={dataSet}
          optionsRenderer={renderUserOption}
          optionsDataSet={nonePermissionDs}
          renderer={renderer}
          selectName="iamUserId"
          addText={formatMessage({ id: `${intlPrefix}.add.member` })}
        />
      )}
    </>
  );
});
