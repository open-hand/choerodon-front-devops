/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { withRouter } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Form, TextField, Select, Progress,CheckBox } from "choerodon-ui/pro";
import { Content, axios } from "@choerodon/master";
import { injectIntl } from "react-intl";
import _ from "lodash";
import debounce from "lodash/debounce";
import get from "lodash/get";
import some from "lodash/some";
import MouserOverWrapper from "../../../../../components/MouseOverWrapper";
import { useFormStore } from "./stores";
import { handlePromptError } from "../../../../../utils";
import IssueType from "../../../components/issue-type";

import "../../../../main.less";
import "./index.less";
import "../index.less";
import {getTypeCode} from '@/utils/getTypeCode';

const { Option, OptGroup } = Select;

function BranchCreate(props) {
  const {
    modal,
    handleRefresh,
    contentStore,
    formDs,
    projectId,
    appServiceId,
    intl: { formatMessage },
    projectOptionsDs,
    AppState: {
      currentMenuType: { categories },
    },
  } = useFormStore();

  const [branchPageSize, setBranchPageSize] = useState(3);
  const [tagPageSize, setTagPageSize] = useState(3);
  const [prefixData, setPrefixeData] = useState("");
  const [branchOringData, setBranchOringData] = useState([]);
  const [branchTagData, setBranchTagData] = useState([]);
  const [loadMoreBranch, setLoadMoreBranch] = useState(false);
  const [loadMoreTag, setLoadMoreTag] = useState(false);
  const [moreTagLoading, setMoreTagLoading] = useState(false);
  const [moreBranchLoading, setMoreBranchLoading] = useState(false);
  const [selectCom, setSelectCom] = useState(null);
  const [isCallHandleInput, setIsCallHandleInput] = useState(false);
  const [isOPERATIONS, setIsOPERATIONS] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const issueOptionsDs =  formDs?.getField('issue')?.options
  const categorieArray=[ "N_AGILE","N_WATERFALL"];
  useEffect(() => {
    setIsOPERATIONS(!some(categories||[], function(item){ return categorieArray.includes(item.code) }));
  }, [categories]);

  useEffect(() => {
    loadBranchData(branchPageSize);
    loadTagData(tagPageSize);
  }, [appServiceId]);

  const searchData = useMemo(
    () =>
      _.debounce((text) => {
        if (selectCom && selectCom.options) {
          selectCom.options.changeStatus("loading");
        }
        axios
          .all([
            contentStore.loadBranchData(
              projectId,
              appServiceId,
              branchPageSize,
              text
            ),
            contentStore.loadTagData(
              projectId,
              appServiceId,
              tagPageSize,
              text
            ),
          ])
          .then(
            axios.spread((branchs, tags) => {
              if (selectCom && selectCom.options) {
                selectCom.options.changeStatus("ready");
              }
              if (handlePromptError(branchs) || handlePromptError(tags)) {
                setLoadMoreBranch(judgeShowMore(branchs));
                setLoadMoreTag(judgeShowMore(tags));
                const value = formDs.current.get("branchOrigin");
                if (
                  !text &&
                  value &&
                  !(
                    _.findIndex(
                      branchs.list,
                      (item) => item.branchName === value.slice(0, -7)
                    ) !== -1 ||
                    // eslint-disable-next-line max-len
                    _.findIndex(
                      tags.list,
                      (item) => item.release.tagName === value.slice(0, -7)
                    ) !== -1
                  )
                ) {
                  if (value.slice(-7) === "_type_b") {
                    branchs.list.push({
                      branchName: value.slice(0, -7),
                    });
                  } else {
                    tags.list.push({
                      release: {
                        tagName: value.slice(0, -7),
                      },
                    });
                  }
                }
                setBranchOringData(branchs.list || []);
                setBranchTagData(tags.list || []);
              }
            })
          );
      }, 700),
    [selectCom, projectId, appServiceId, branchPageSize, tagPageSize]
  );

  /**
   * 加载分支数据
   * @param BranchPageSize
   */
  async function loadBranchData(BranchPageSize) {
    setMoreBranchLoading(true);
    const data = await contentStore.loadBranchData(
      projectId,
      appServiceId,
      BranchPageSize
    );
    setMoreBranchLoading(false);
    if (handlePromptError(data)) {
      setBranchOringData(data.list);
      setLoadMoreBranch(judgeShowMore(data));
    }
  }

  /**
   * 加载标记数据
   * @param TagPageSize
   */
  async function loadTagData(TagPageSize) {
    setMoreTagLoading(true);
    const data = await contentStore.loadTagData(
      projectId,
      appServiceId,
      TagPageSize
    );
    setMoreTagLoading(false);
    if (handlePromptError(data)) {
      setBranchTagData(data.list);
      setLoadMoreTag(judgeShowMore(data));
    }
  }
  /**
   * 创建
   */
  async function handleOk() {
    try {
      if ((await formDs.submit()) !== false) {
        handleRefresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  modal.handleOk(handleOk);

  /**
   * 切换issue
   * @param value
   */
  const changeIssue = (value) => {
    let type;
    const { typeCode, issueNum } = value || {};
    if(issueNum=== '我的问题myquestion') {
      return
    }
    formDs.current.set("branchName", issueNum);
    switch (typeCode) {
      case "story":
        type = "feature";
        break;
      case "bug":
        type = "bugfix";
        break;
      case "issue_epic":
        type = "custom";
        break;
      case "sub_task":
        type = "feature";
        break;
      case "task":
        type = "feature";
        break;
      default:
        type = "custom";
    }
    formDs.current.set("branchType", type);
  };

  /**
   * 获取列表的icon
   * @param type 分支类型
   * @returns {*}
   */
  const getIcon = (type) => {
    let icon;
    switch (type) {
      case "feature":
        icon = <span className="c7n-branch-icon icon-feature">F</span>;
        break;
      case "bugfix":
        icon = <span className="c7n-branch-icon icon-develop">B</span>;
        break;
      case "hotfix":
        icon = <span className="c7n-branch-icon icon-hotfix">H</span>;
        break;
      case "master":
        icon = <span className="c7n-branch-icon icon-master">M</span>;
        break;
      case "release":
        icon = <span className="c7n-branch-icon icon-release">R</span>;
        break;
      default:
        icon = <span className="c7n-branch-icon icon-custom">C</span>;
    }
    return icon;
  };

  // 用于分支类型的渲染函数
  const renderBranchType = ({ text }) => {
    if (text !== "custom") {
      setPrefixeData(text ? `${text}-` : "");
      contentStore.setBranchPrefix(text ? `${text}-` : "");
    } else {
      contentStore.setBranchPrefix(null);
      setPrefixeData(null);
    }
    return text ? (
      <div>
        <div style={{ width: "100%" }}>
          {getIcon(text)}
          <span className="c7n-branch-text">{text}</span>
        </div>
      </div>
    ) : null;
  };
  // 用于分支类型的渲染函数
  const renderOptionsBranchType = ({ text }) => (
    <div style={{ width: "100%" }}>
      {getIcon(text)}
      <span className="c7n-branch-text">{text}</span>
    </div>
  );

  // 用于问题名称的渲染函数
  const renderIssueName = ({ typeCode, issueNum, summary, issueTypeVO }) => {
    const{icon,color}=getTypeCode(typeCode);
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
          <span style={{ color: "rgb(0,0,0,0.65)" }}>{issueNum}</span>
          <MouserOverWrapper
            style={{ display: "inline-block", verticalAlign: "sub" }}
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
    const { typeCode, issueNum, summary, issueTypeVO } = value || {};
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
    issueOptionsDs?.setState('myquestionBool',bool)
    issueOptionsDs?.query()
  };

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

  const issueNameOptionRender = ({ record,text }) => {
    const typeCode = record.get("typeCode");
    const issueNum = record.get("issueNum");
    const summary = record.get("summary");
    const issueTypeVO = record.get("issueTypeVO");
    return summary === "我的问题myquestion" ? (
      <div
        role="none"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          paddingLeft: 4,  paddingBottom: 10, display: 'flex', alignItems: 'center',
          position: 'relative',
        }}
      >
        <div style={{position:'absolute',zIndex:99999,left:-15,bottom:-3,width:'calc(100% + 30px)',height: 1,background: '#D9E6F2'}}></div>
        <CheckBox name="base" checked={issueOptionsDs?.getState('myquestionBool')} onChange={myquestionChange}><span style={{marginLeft:4}}>
        我的问题
          </span></CheckBox>
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

  const loadMore = (type, e) => {
    e.stopPropagation();
    if (type === "branch") {
      const pageSize = branchPageSize + 10;
      setBranchPageSize(pageSize);
      loadBranchData(pageSize);
    } else {
      const pageSize = tagPageSize + 10;
      setTagPageSize(pageSize);
      loadTagData(pageSize);
    }
  };

  const rednerBranchOptionOrigin = (args) => {
    const { record, text } = args;
    // meaning是默认的textfiled 此处用于判断 是否是加载更多的按钮
    if (!record.get("meaning")) {
      // 根据value来判断是哪一个加载更多的按钮
      let progress = null;
      if (record.get("value") === "tag") {
        progress = moreTagLoading ? (
          <Progress type="loading" size="small" />
        ) : null;
      } else {
        progress = moreBranchLoading ? (
          <Progress type="loading" size="small" />
        ) : null;
      }
      return (
        <div
          onClick={loadMore.bind(this, record.get("value"))}
          className="c7n-option-popover"
          role="none"
        >
          {progress}
          <span className="c7n-option-span">
            {formatMessage({ id: "loadMore" })}
          </span>
        </div>
      );
    }

    return renderOption(record.get("value"));
  };

  // 用于渲染分支来源
  const renderBranchOrigin = (args) => {
    const { text, value } = args;
    if (text || value) {
      return null;
    }
    return renderOption(value);
  };

  function renderOption(text) {
    if (!text) return null;
    return (
      <span>
        <i
          className={`icon c7n-branch-formItem-icon ${
            text.slice(-7) === "_type_t" ? "icon-local_offer" : "icon-branch"
          }`}
        />
        {text && text.slice(0, -7)}
      </span>
    );
  }

  function searchMatcher() {
    return true;
  }

  function handleInput({ target: { value } }) {
    if (!isCallHandleInput) setIsCallHandleInput(true);
    searchData(value);
  }

  function changeRef(obj) {
    if (obj) {
      const { fields } = obj;
      if (fields instanceof Array && fields.length > 0) {
        const select = fields[1];
        if (select && !selectCom) {
          setSelectCom(select);
        }
      }
    }
  }

  function handleBlur(e) {
    if (branchOringData.length === 0 && branchTagData.length === 0) {
      formDs.current.set("branchOrigin", null);
    }
    searchData("");
  }

  const loadProjectData = useCallback(() => {
    projectOptionsDs.query();
  }, []);

  const handleProjectSearch = useCallback((e) => {
    e.persist();
    searchProjectData(e.target.value);
  }, []);

  const searchProjectData = useMemo(
    () =>
      debounce((value) => {
        projectOptionsDs.setQueryParameter("params", value);
        setSearchValue(value);
        loadProjectData();
      }, 500),
    []
  );

  const handleProjectBlur = useCallback(() => {
    if (searchValue) {
      searchProjectData("");
    }
  }, [searchValue]);

  const renderProjectOption = useCallback(({ text, value }) => {
    if (String(value) === String(projectId)) {
      return `${text}（本项目）`;
    }
    return text;
  }, []);

  const renderProject = useCallback(({ value }) => {
    const currentValue = get(value, "id");
    const text = get(value, "name");
    return renderProjectOption({ text, value: currentValue });
  }, []);

  const changeProject = useCallback((value) => {
    issueOptionsDs?.setState('projectid', value.id);
    issueOptionsDs?.query();
  }, []);

  return (
    <div className="sidebar-content c7n-createBranch">
      <div style={{ width: "75%" }}>
        <Form dataSet={formDs} columns={5} ref={changeRef}>
          { !isOPERATIONS &&[
            <Select
              name="project"
              colSpan={5}
              searchable
              searchMatcher={() => true}
              onInput={handleProjectSearch}
              optionRenderer={renderProjectOption}
              onChange={changeProject}
              renderer={renderProject}
              onBlur={handleProjectBlur}
              clearButton={false}
              pagingOptionContent={
                <span className="c7ncd-select-load-more-text">加载更多</span>
              }
            />,
            <Select
              name="issue"
              colSpan={5}
              onChange={changeIssue}
              onInput={handleIssueSearch}
              onBlur={handleIssueBlur}
              optionRenderer={issueNameOptionRender}
              renderer={issueNameRender}
              searchable
              searchMatcher={() => true}
              pagingOptionContent={<span className="c7ncd-select-load-more-text">加载更多</span>}
              clearButton={false}
            />,
          ]}
          <Select
            colSpan={5}
            name="branchOrigin"
            searchMatcher={searchMatcher}
            onInput={handleInput}
            onBlur={handleBlur}
            searchable
            optionRenderer={rednerBranchOptionOrigin}
            renderer={({ text }) => text}
          >
            <OptGroup
              label={formatMessage({ id: "branch.branch" })}
              key="proGroup"
            >
              {branchOringData.map((s) => (
                <Option
                  value={`${s.branchName}_type_b`}
                  key={s.branchName}
                  title={s.branchName}
                >
                  {s.branchName}
                </Option>
              ))}
              {loadMoreBranch ? <Option value="branch" /> : null}
            </OptGroup>
            <OptGroup label={formatMessage({ id: "branch.tag" })} key="more">
              {branchTagData.map((s) =>
                s.release ? (
                  <Option
                    value={`${s.release.tagName}_type_t`}
                    key={s.release.tagName}
                  >
                    {s.release.tagName}
                  </Option>
                ) : null
              )}
              {loadMoreTag ? <Option value="tag" /> : null}
            </OptGroup>
          </Select>
          <Select
            colSpan={2}
            name="branchType"
            renderer={renderBranchType}
            optionRenderer={renderOptionsBranchType}
          >
            {["feature", "bugfix", "release", "hotfix", "custom"].map((s) => (
              <Option value={s} key={s} title={s}>
                {s}
              </Option>
            ))}
          </Select>
          <TextField
            colSpan={3}
            name="branchName"
            renderer={({ value }) =>
              value ? `${prefixData || ""}${value}` : value
            }
          />
        </Form>
      </div>
    </div>
  );
}
export default withRouter(injectIntl(observer(BranchCreate)));

function judgeShowMore(data) {
  return data.total > data.size && data.size > 0;
}
