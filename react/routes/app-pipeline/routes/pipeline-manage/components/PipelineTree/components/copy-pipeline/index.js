import React, { useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { useSessionStorageState } from 'ahooks';
import { Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';

export default observer(({
  copyPipelineDataSet, modal, record, seletDs,
}) => {
  const [, setSesstionData] = useSessionStorageState(PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY);

  const history = useHistory();
  const { pathname, search } = useLocation();

  useEffect(() => {
    copyPipelineDataSet.reset();
    seletDs.query();
    return function () {
      seletDs.reset();
    };
  }, []);

  useEffect(() => {
    modal.update({
      okProps: {
        disabled: !copyPipelineDataSet.current.get('appServiceId'),
      },
    });
  }, [copyPipelineDataSet.current.get('appServiceId')]);

  function handlePipelineCopy() {
    setSesstionData({
      appService: copyPipelineDataSet.current.get('appServiceId'),
    });
    history.push({
      pathname: `${pathname}/edit/copy/${record.get('id')}`,
      search: `${search}&searchTabKey=basicInfo`,
    });
  }

  modal.handleOk(handlePipelineCopy);

  const renderer = ({ text }) => text;

  const optionRenderer = ({ text }) => (text === '加载更多' ? (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      role="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onClick={handleClickMore}
    >
      {text}
    </a>
  ) : text);

  const handleOnInput = (e) => {
    e.persist();
    searchVersion(e.target.value);
  };
  const searchVersion = useMemo(
    () => debounce((value) => {
      if (value) {
        seletDs.setQueryParameter('params', { appServiceName: value });
        seletDs.query();
      }
    }, 500),
    [],
  );
  const handleBlur = () => {
    seletDs.setQueryParameter('params', { appServiceName: '' });
    seletDs.query();
  };

  const handleClickMore = async (e) => {
    e.stopPropagation();
    const pageSize = seletDs.pageSize + 20;
    // eslint-disable-next-line no-param-reassign
    seletDs.pageSize = pageSize;
    seletDs.setQueryParameter('params', { size: pageSize });
    seletDs.query();
  };

  return (
    <div>
      <p>
        请为新的流水线选择关联应用服务
      </p>
      <Form dataSet={copyPipelineDataSet}>
        <Select
          name="appServiceId"
          searchable
          onInput={handleOnInput}
          onBlur={handleBlur}
          searchMatcher="appServiceName"
          optionRenderer={optionRenderer}
          renderer={renderer}
        />
      </Form>
    </div>
  );
});
