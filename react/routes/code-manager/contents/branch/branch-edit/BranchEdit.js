import React, {
  useCallback, useMemo, useState,
} from 'react';
import { Form, Select, Button } from 'choerodon-ui/pro';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import some from 'lodash/some';
import MouserOverWrapper from '../../../../../components/MouseOverWrapper';
import IssueType from '../../../components/issue-type';
import { useSelectStore } from './stores';

function BranchEdit() {
  const {
    formatMessage,
    modal,
    handleRefresh,
    selectDs,
    projectOptionsDs,
    AppState: { currentMenuType: { projectId } },
  } = useSelectStore();

  const [searchValue, setSearchValue] = useState('');

  /**
   * 创建
   */
  async function handleOk() {
    try {
      if ((await selectDs.submit()) !== false) {
        handleRefresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  modal.handleOk(() => handleOk());

  const loadData = useCallback(() => {
    projectOptionsDs.query();
  }, []);

  const handleSearch = useCallback((e) => {
    e.persist();
    searchData(e.target.value);
  }, []);

  const searchData = useMemo(() => debounce((value) => {
    projectOptionsDs.setQueryParameter('params', value);
    setSearchValue(value);
    loadData();
  }, 500), []);

  const handleBlur = useCallback(() => {
    if (searchValue) {
      searchData('');
    }
  }, [searchValue]);

  const renderProjectOption = useCallback(({ text, value }) => {
    if (String(value) === String(projectId)) {
      return `${text}（本项目）`;
    }
    return text;
  }, []);

  const renderProject = useCallback(({ value }) => {
    const currentValue = get(value, 'id');
    const text = get(value, 'name');
    return renderProjectOption({ text, value: currentValue });
  }, []);

  // 用于问题名称的渲染函数
  const renderIssueName = ({
    typeCode, issueNum, summary, issueTypeVO,
  }) => {
    let mes = '';
    let icon = '';
    let color = '';
    switch (typeCode) {
      case 'story':
        mes = formatMessage({ id: 'branch.issue.story' });
        icon = 'agile_story';
        color = '#00bfa5';
        break;
      case 'bug':
        mes = formatMessage({ id: 'branch.issue.bug' });
        icon = 'agile_fault';
        color = '#f44336';
        break;
      case 'issue_epic':
        mes = formatMessage({ id: 'branch.issue.epic' });
        icon = 'agile_epic';
        color = '#743be7';
        break;
      case 'sub_task':
        mes = formatMessage({ id: 'branch.issue.subtask' });
        icon = 'agile_subtask';
        color = '#4d90fe';
        break;
      default:
        mes = formatMessage({ id: 'branch.issue.task' });
        icon = 'agile_task';
        color = '#4d90fe';
    }
    return (
      <>
        {issueTypeVO ? <IssueType data={issueTypeVO} /> : (
          <div style={{ color }} className="branch-issue">
            <i className={`icon icon-${icon}`} />
          </div>
        )}
        <span className="branch-issue-content">
          <span style={{ color: 'rgb(0,0,0,0.65)' }}>{issueNum}</span>
          <MouserOverWrapper
            style={{ display: 'inline-block', verticalAlign: 'sub' }}
            width="350px"
            text={summary}
          >
            {summary}
          </MouserOverWrapper>
        </span>
      </>
    );
  };

  const issueNameRender = ({ text, value }) => {
    const {
      typeCode, issueNum, summary, issueTypeVO,
    } = value || {};
    return (
      typeCode || issueTypeVO ? (
        <span>
          {renderIssueName({
            typeCode, issueNum, summary, issueTypeVO,
          })}
        </span>
      ) : null
    );
  };

  const issueNameOptionRender = ({ record }) => {
    const issueNum = record.get('issueNum');
    const summary = record.get('summary');
    const issueTypeVO = record.get('issueTypeVO');
    return (
      <span>
        {renderIssueName({
          issueNum, summary, issueTypeVO,
        })}
      </span>
    );
  };

  const handleDeleteRecord = useCallback((record) => {
    selectDs.remove(record);
  }, [selectDs]);

  const handleAddRecord = useCallback(() => {
    selectDs.create();
  }, [selectDs]);

  const handleIssueFilter = useCallback((record) => {
    const issueId = record.get('issueId');
    const selectedIssueIds = selectDs.map((selectedRecord) => selectedRecord.get('issue')?.issueId) || [];
    return selectedIssueIds.indexOf(issueId) === -1;
  });

  return (
    <div>
      {selectDs.map((record) => (
        <Form record={record} columns={11}>
          <Select
            name="project"
            searchable
            searchMatcher={() => true}
            onInput={handleSearch}
            optionRenderer={renderProjectOption}
            renderer={renderProject}
            onBlur={handleBlur}
            clearButton={false}
            pagingOptionContent={<span className="c7ncd-select-load-more-text">加载更多</span>}
            colSpan={5}
          />
          <Select
            name="issue"
            optionRenderer={issueNameOptionRender}
            renderer={issueNameRender}
            searchable
            searchMatcher="content"
            colSpan={5}
            optionsFilter={handleIssueFilter}
          />
          <Button
            icon="delete"
            funcType="flat"
            onClick={() => handleDeleteRecord(record)}
            className="c7ncd-form-record-delete-btn"
          />
        </Form>
      ))}
      <Button
        icon="add"
        funcType="flat"
        onClick={handleAddRecord}
      >
        添加关联问题
      </Button>
    </div>
  );
}
export default injectIntl(observer(BranchEdit));
