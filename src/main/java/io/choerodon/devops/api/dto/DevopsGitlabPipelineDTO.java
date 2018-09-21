package io.choerodon.devops.api.dto;

import java.util.Date;
import java.util.List;

import io.choerodon.devops.infra.dataobject.gitlab.CommitStatuseDO;

public class DevopsGitlabPipelineDTO {

    private String status;
    private String version;
    private Long pipelineId;
    private Long gitlabProjectId;
    private String pipelineUserUrl;
    private String pipelineUserName;
    private String gitlabUrl;
    private String ref;
    private String commit;
    private String CommitUserUrl;
    private String CommitUserName;
    private String commitContent;
    private Boolean latest;
    private String pipelineTime;
    private Date creationDate;
    private List<CommitStatuseDO> stages;


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Long getPipelineId() {
        return pipelineId;
    }

    public void setPipelineId(Long pipelineId) {
        this.pipelineId = pipelineId;
    }

    public String getPipelineUserUrl() {
        return pipelineUserUrl;
    }

    public void setPipelineUserUrl(String pipelineUserUrl) {
        this.pipelineUserUrl = pipelineUserUrl;
    }

    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public String getCommit() {
        return commit;
    }

    public void setCommit(String commit) {
        this.commit = commit;
    }

    public String getCommitUserUrl() {
        return CommitUserUrl;
    }

    public void setCommitUserUrl(String commitUserUrl) {
        CommitUserUrl = commitUserUrl;
    }

    public String getCommitContent() {
        return commitContent;
    }

    public void setCommitContent(String commitContent) {
        this.commitContent = commitContent;
    }

    public Boolean getLatest() {
        return latest;
    }

    public void setLatest(Boolean latest) {
        this.latest = latest;
    }

    public String getPipelineTime() {
        return pipelineTime;
    }

    public void setPipelineTime(String pipelineTime) {
        this.pipelineTime = pipelineTime;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public List<CommitStatuseDO> getStages() {
        return stages;
    }

    public void setStages(List<CommitStatuseDO> stages) {
        this.stages = stages;
    }

    public String getGitlabUrl() {
        return gitlabUrl;
    }

    public void setGitlabUrl(String gitlabUrl) {
        this.gitlabUrl = gitlabUrl;
    }

    public Long getGitlabProjectId() {
        return gitlabProjectId;
    }

    public void setGitlabProjectId(Long gitlabProjectId) {
        this.gitlabProjectId = gitlabProjectId;
    }

    public String getPipelineUserName() {
        return pipelineUserName;
    }

    public void setPipelineUserName(String pipelineUserName) {
        this.pipelineUserName = pipelineUserName;
    }

    public String getCommitUserName() {
        return CommitUserName;
    }

    public void setCommitUserName(String commitUserName) {
        CommitUserName = commitUserName;
    }
}
