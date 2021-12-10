/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Form, Select, Button, Tooltip, CheckBox,
} from 'choerodon-ui/pro';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import IssueType from '../../../components/issue-type';
import { useSelectStore } from './stores';

function BranchEdit() {
  const {
    formatMessage,
    modal,
    handleRefresh,
    selectDs,
    projectOptionsDs,
    AppState: {
      currentMenuType: { projectId },
    },
  } = useSelectStore();

  const issueOptionsDs = selectDs?.current?.getField('issue')?.options;

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

  const searchData = useMemo(
    () => debounce((value) => {
      projectOptionsDs.setQueryParameter('params', value);
      setSearchValue(value);
      loadData();
    }, 500),
    [],
  );

  const handleBlur = useCallback(() => {
    if (searchValue) {
      searchData('');
    }
  }, [searchValue]);

  const issueQuery = useCallback(
    debounce((value) => {
      issueOptionsDs?.setQueryParameter('content', value);
      issueOptionsDs?.query();
    }, 500),
    [],
  );

  const handleIssueSearch = useCallback((e) => {
    e.persist();
    issueQuery(e.target.value);
  }, []);

  const handleIssueBlur = () => {
    issueOptionsDs?.setQueryParameter('content', '');
    issueOptionsDs?.setState('myquestionBool', false);
    issueOptionsDs?.query();
  };

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
        {issueTypeVO ? (
          <IssueType data={issueTypeVO} />
        ) : (
          <div style={{ color }} className="branch-issue">
            <i className={`icon icon-${icon}`} />
          </div>
        )}
        <span className="branch-issue-content">
          <span style={{ color: 'rgb(0,0,0,0.65)' }}>{issueNum}</span>
          <Tooltip title={summary}>{summary}</Tooltip>
        </span>
      </>
    );
  };

  const issueNameRender = ({ text, value }) => {
    const {
      typeCode, issueNum, summary, issueTypeVO,
    } = value || {};
    return typeCode || issueTypeVO ? (
      <span>
        {renderIssueName({
          typeCode,
          issueNum,
          summary,
          issueTypeVO,
        })}
      </span>
    ) : null;
  };

  const myquestionChange = (bool) => {
    issueOptionsDs?.setState('myquestionBool', bool);
    issueOptionsDs?.query();
  };

  const changeProject = (value) => {
    selectDs?.current?.getField('issue')?.options?.setState('projectid', value.id);
    selectDs?.current?.getField('issue')?.options?.query();
  };

  const issueNameOptionRender = ({ record }) => {
    const typeCode = record.get('typeCode');
    const issueNum = record.get('issueNum');
    const summary = record.get('summary');
    const issueTypeVO = record.get('issueTypeVO');
    return summary === '我的问题myquestion' ? (
      <div
        role="none"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          paddingLeft: 4,
          paddingBottom: 10,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', zIndex: 99999, left: -15, bottom: -3, width: 'calc(100% + 30px)', height: 1, background: '#D9E6F2',
        }}
        />
        <CheckBox name="base" checked={issueOptionsDs?.getState('myquestionBool')} onChange={myquestionChange}>
          <span style={{ marginLeft: 4 }}>我的问题</span>
        </CheckBox>
      </div>
    ) : (
      renderIssueName({
        typeCode,
        issueNum,
        summary,
        issueTypeVO,
      })
    );
  };

  const handleDeleteRecord = useCallback(
    (record) => {
      selectDs.remove(record);
    },
    [selectDs],
  );

  const handleAddRecord = useCallback(() => {
    selectDs.create();
  }, [selectDs]);

  const handleIssueFilter = useCallback((record) => {
    const issueId = record.get('issueId');
    const selectedIssueIds = selectDs.map((selectedRecord) => selectedRecord.get('issue')?.issueId) || [];
    // 只有2条记录并且其中一条是我的问题，一条已经被选中
    if (issueOptionsDs?.length === 2 && selectedIssueIds.indexOf(issueOptionsDs?.get(1)?.get('issueId')) !== -1 && issueId === '-1') {
      return false;
    }
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
            onChange={changeProject}
            clearButton={false}
            pagingOptionContent={<span className="c7ncd-select-load-more-text">加载更多</span>}
            colSpan={5}
          />
          <Select
            name="issue"
            onInput={handleIssueSearch}
            onBlur={handleIssueBlur}
            optionRenderer={issueNameOptionRender}
            renderer={issueNameRender}
            searchable
            searchMatcher={() => true}
            colSpan={5}
            optionsFilter={handleIssueFilter}
            pagingOptionContent={<span className="c7ncd-select-load-more-text">加载更多</span>}
            clearButton={false}
          />
          <Button
            icon="delete"
            funcType="flat"
            onClick={() => handleDeleteRecord(record)}
            className="c7ncd-form-record-delete-btn"
          />
        </Form>
      ))}
      <Button icon="add" funcType="flat" onClick={handleAddRecord}>
        添加关联问题
      </Button>
    </div>
  );
}
export default injectIntl(observer(BranchEdit));
