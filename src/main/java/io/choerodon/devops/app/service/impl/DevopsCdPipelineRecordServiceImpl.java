package io.choerodon.devops.app.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.google.gson.Gson;
import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.common.IOUtils;
import net.schmizz.sshj.connection.channel.direct.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import io.choerodon.core.exception.CommonException;
import io.choerodon.devops.api.vo.CdHostDeployConfigVO;
import io.choerodon.devops.app.service.DevopsCdAuditRecordService;
import io.choerodon.devops.app.service.DevopsCdJobRecordService;
import io.choerodon.devops.app.service.DevopsCdPipelineRecordService;
import io.choerodon.devops.app.service.DevopsCdStageRecordService;
import io.choerodon.devops.infra.constant.PipelineCheckConstant;
import io.choerodon.devops.infra.dto.DevopsCdAuditRecordDTO;
import io.choerodon.devops.infra.dto.DevopsCdJobRecordDTO;
import io.choerodon.devops.infra.dto.DevopsCdPipelineRecordDTO;
import io.choerodon.devops.infra.dto.DevopsCdStageRecordDTO;
import io.choerodon.devops.infra.dto.workflow.DevopsPipelineDTO;
import io.choerodon.devops.infra.dto.workflow.DevopsPipelineStageDTO;
import io.choerodon.devops.infra.dto.workflow.DevopsPipelineTaskDTO;
import io.choerodon.devops.infra.enums.CdHostAccountType;
import io.choerodon.devops.infra.enums.DeployType;
import io.choerodon.devops.infra.enums.JobTypeEnum;
import io.choerodon.devops.infra.enums.WorkFlowStatus;
import io.choerodon.devops.infra.mapper.DevopsCdJobRecordMapper;
import io.choerodon.devops.infra.mapper.DevopsCdPipelineRecordMapper;
import io.choerodon.devops.infra.util.TypeUtil;

/**
 * 〈功能简述〉
 * 〈〉
 *
 * @author wanghao
 * @since 2020/7/2 10:41
 */
@Service
public class DevopsCdPipelineRecordServiceImpl implements DevopsCdPipelineRecordService {

    private static final String ERROR_SAVE_PIPELINE_RECORD_FAILED = "error.save.pipeline.record.failed";
    private static final String ERROR_UPDATE_PIPELINE_RECORD_FAILED = "error.update.pipeline.record.failed";
    private static final String ERROR_DOCKER_LOGIN = "error.docker.login";
    private static final String ERROR_DOCKER_PULL = "error.docker.pull";
    private static final String ERROR_DOCKER_RUN = "error.docker.run";
    private static final String UNAUTHORIZED = "unauthorized";

    public static final Logger LOGGER = LoggerFactory.getLogger(DevopsCdPipelineRecordServiceImpl.class);

    private static final Gson gson = new Gson();

    @Autowired
    private DevopsCdStageRecordService stageRecordService;

    @Autowired
    private DevopsCdAuditRecordService devopsCdAuditRecordService;

    @Autowired
    private DevopsCdJobRecordService devopsCdJobRecordService;

    @Autowired
    private DevopsCdPipelineRecordMapper devopsCdPipelineRecordMapper;

    @Autowired
    private DevopsCdJobRecordMapper devopsCdJobRecordMapper;

    @Autowired
    private DevopsCdStageRecordService devopsCdStageRecordService;

    @Override
    public DevopsCdPipelineRecordDTO queryByGitlabPipelineId(Long gitlabPipelineId) {
        Assert.notNull(gitlabPipelineId, PipelineCheckConstant.ERROR_GITLAB_PIPELINE_ID_IS_NULL);
        DevopsCdPipelineRecordDTO devopsCdPipelineRecordDTO = new DevopsCdPipelineRecordDTO();
        devopsCdPipelineRecordDTO.setGitlabPipelineId(gitlabPipelineId);
        return devopsCdPipelineRecordMapper.selectOne(devopsCdPipelineRecordDTO);
    }

    @Override
    @Transactional
    public void save(DevopsCdPipelineRecordDTO devopsCdPipelineRecordDTO) {
        if (devopsCdPipelineRecordMapper.insertSelective(devopsCdPipelineRecordDTO) != 1) {
            throw new CommonException(ERROR_SAVE_PIPELINE_RECORD_FAILED);
        }
    }

    @Override
    public void updateStatusById(Long pipelineRecordId, String status) {
        DevopsCdPipelineRecordDTO pipelineRecordDTO = devopsCdPipelineRecordMapper.selectByPrimaryKey(pipelineRecordId);
        pipelineRecordDTO.setStatus(status);
        if (devopsCdPipelineRecordMapper.updateByPrimaryKey(pipelineRecordDTO) != 1) {
            throw new CommonException(ERROR_UPDATE_PIPELINE_RECORD_FAILED);
        }
    }

    /**
     * 准备workflow创建实例所需数据
     * 为此workflow下所有stage创建记录
     */
    @Override
    public DevopsPipelineDTO createCDWorkFlowDTO(Long pipelineRecordId) {
        // 1.
        DevopsPipelineDTO devopsPipelineDTO = new DevopsPipelineDTO();
        devopsPipelineDTO.setPipelineRecordId(pipelineRecordId);
        DevopsCdPipelineRecordDTO devopsCdPipelineRecordDTO = devopsCdPipelineRecordMapper.selectByPrimaryKey(pipelineRecordId);
        devopsPipelineDTO.setPipelineName(devopsCdPipelineRecordDTO.getPipelineName());
        devopsPipelineDTO.setBusinessKey(devopsCdPipelineRecordDTO.getBusinessKey());

        // 2.
        List<DevopsPipelineStageDTO> devopsPipelineStageDTOS = new ArrayList<>();
        List<DevopsCdStageRecordDTO> stageRecordDTOList = stageRecordService.queryByPipelineRecordId(pipelineRecordId);
        if (CollectionUtils.isEmpty(stageRecordDTOList)) {
            return null;
        }

        for (int i = 0; i < stageRecordDTOList.size(); i++) {
            // 3.
            DevopsPipelineStageDTO stageDTO = new DevopsPipelineStageDTO();
            DevopsCdStageRecordDTO stageRecordDTO = stageRecordDTOList.get(i);
            stageDTO.setStageRecordId(stageRecordDTO.getId());
            if (stageRecordDTO.getTriggerType().equals(DeployType.MANUAL.getType())) {
                List<DevopsCdAuditRecordDTO> stageAuditRecordDTOS = devopsCdAuditRecordService.queryByStageRecordId(stageRecordDTO.getId());
                if (CollectionUtils.isEmpty(stageAuditRecordDTOS)) {
                    throw new CommonException("error.audit.stage.noUser");
                }
                List<String> users = stageAuditRecordDTOS.stream().map(t -> TypeUtil.objToString(t.getUserId())).collect(Collectors.toList());
                stageDTO.setUsernames(users);
                stageDTO.setMultiAssign(users.size() > 1);
            }
            // 4.
            List<DevopsCdJobRecordDTO> jobRecordDTOList = devopsCdJobRecordService.queryByStageRecordId(stageRecordDTO.getId());
            List<DevopsPipelineTaskDTO> taskDTOList = new ArrayList<>();
            if (!CollectionUtils.isEmpty(jobRecordDTOList)) {
                jobRecordDTOList.forEach(jobRecordDTO -> {
                    DevopsPipelineTaskDTO taskDTO = new DevopsPipelineTaskDTO();
                    taskDTO.setTaskRecordId(jobRecordDTO.getId());
                    taskDTO.setTaskName(jobRecordDTO.getName());
                    if (jobRecordDTO.getType().equals(JobTypeEnum.CD_AUDIT.value())) {
                        List<DevopsCdAuditRecordDTO> jobAuditRecordDTOS = devopsCdAuditRecordService.queryByJobRecordId(jobRecordDTO.getId());
                        if (CollectionUtils.isEmpty(jobAuditRecordDTOS)) {
                            throw new CommonException("error.audit.job.noUser");
                        }
                        List<String> taskUsers = jobAuditRecordDTOS.stream().map(t -> TypeUtil.objToString(t.getUserId())).collect(Collectors.toList());
                        taskDTO.setUsernames(taskUsers);
                        taskDTO.setMultiAssign(taskUsers.size() > 1);
                    }
                    taskDTO.setTaskType(jobRecordDTO.getType());
                    if (jobRecordDTO.getCountersigned() != null) {
                        taskDTO.setSign(jobRecordDTO.getCountersigned().longValue());
                    }
                    taskDTOList.add(taskDTO);
                });
            }
            stageDTO.setTasks(taskDTOList);
            // 5.
            if (i != stageRecordDTOList.size() - 1) {
                stageDTO.setNextStageTriggerType(stageRecordDTOList.get(i + 1).getTriggerType());
            }
        }
        devopsPipelineDTO.setStages(devopsPipelineStageDTOS);
        return devopsPipelineDTO;
    }

    @Override
    public void cdHostImageDeploy(Long pipelineRecordId, Long cdStageRecordId, Long cdJobRecordId) {
        LOGGER.info("========================================");
        LOGGER.info("start deploy cd host job,pipelineRecordId:{},cdStageRecordId:{},cdJobRecordId{}", pipelineRecordId, cdStageRecordId, cdJobRecordId);
        SSHClient ssh = new SSHClient();
        Session session = null;
        try {
            // 0.1

            // 1.
            devopsCdJobRecordService.updateStatusById(cdJobRecordId, WorkFlowStatus.RUNNING.toValue());
            // 2.
            DevopsCdJobRecordDTO jobRecordDTO = devopsCdJobRecordMapper.selectByPrimaryKey(cdJobRecordId);
            CdHostDeployConfigVO cdHostDeployConfigVO = gson.fromJson(jobRecordDTO.getMetadata(), CdHostDeployConfigVO.class);
            // 3.
            ssh.loadKnownHosts();
            ssh.connect(cdHostDeployConfigVO.getHostIp(), TypeUtil.objToInteger(cdHostDeployConfigVO.getHostPort()));
            if (cdHostDeployConfigVO.getAccountType().equals(CdHostAccountType.PASSWORD.value())) {
                ssh.authPassword(cdHostDeployConfigVO.getUserName(), cdHostDeployConfigVO.getPassword());
            } else {
                ssh.authPublickey(cdHostDeployConfigVO.getUserName());
            }

            // 4.
            // 4.1
            session = ssh.startSession();
            Session.Command cmd = session.exec("docker login");
            String loggerStr = IOUtils.readFully(cmd.getInputStream()).toString();
            LOGGER.info(loggerStr);
            LOGGER.info("docker login status:{}", cmd.getExitStatus());
            if (loggerStr.contains(UNAUTHORIZED) || !StringUtils.isEmpty(cmd.getExitErrorMessage())) {
                throw new CommonException(ERROR_DOCKER_LOGIN);
            }

            // 4.2
            cmd = session.exec("docker pull");
            loggerStr = IOUtils.readFully(cmd.getInputStream()).toString();
            LOGGER.info(loggerStr);
            LOGGER.info("docker pull status:{}", cmd.getExitStatus());
            if (!StringUtils.isEmpty(cmd.getExitErrorMessage())) {
                throw new CommonException(ERROR_DOCKER_PULL);
            }
            // 4.3
            cmd = session.exec("docker run");
            loggerStr = IOUtils.readFully(cmd.getInputStream()).toString();
            LOGGER.info(loggerStr);
            LOGGER.info("docker run status:{}", cmd.getExitStatus());
            if (!StringUtils.isEmpty(cmd.getExitErrorMessage())) {
                throw new CommonException(ERROR_DOCKER_RUN);
            }
            devopsCdJobRecordService.updateStatusById(cdJobRecordId, WorkFlowStatus.SUCCESS.toValue());
        } catch (Exception e) {
            devopsCdJobRecordService.updateStatusById(cdJobRecordId, WorkFlowStatus.FAILED.toValue());
            devopsCdStageRecordService.updateStatusById(cdStageRecordId, WorkFlowStatus.FAILED.toValue());
            updateStatusById(pipelineRecordId, WorkFlowStatus.FAILED.toValue());
        } finally {
            closeSsh(ssh, session);
        }
    }

    private void closeSsh(SSHClient ssh, Session session) {
        try {
            if (session != null) {
                session.close();
            }
            ssh.disconnect();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void deleteByPipelineId(Long pipelineId) {
        Assert.notNull(pipelineId, "error.pipeline.id.is.null");
        DevopsCdPipelineRecordDTO devopsCdPipelineRecordDTO = new DevopsCdPipelineRecordDTO();
        devopsCdPipelineRecordDTO.setPipelineId(pipelineId);
        List<DevopsCdPipelineRecordDTO> devopsCdPipelineRecordDTOS = devopsCdPipelineRecordMapper.select(devopsCdPipelineRecordDTO);
        //删除cd stage 下的job记录
        if (!CollectionUtils.isEmpty(devopsCdPipelineRecordDTOS)) {
            devopsCdPipelineRecordDTOS.forEach(cdPipelineRecordDTO -> {
                DevopsCdJobRecordDTO devopsCdJobRecordDTO = new DevopsCdJobRecordDTO();
                devopsCdJobRecordDTO.setStageRecordId(cdPipelineRecordDTO.getId());
                devopsCdJobRecordMapper.delete(devopsCdJobRecordDTO);
            });
        }
        // 删除 stage 记录
        devopsCdPipelineRecordMapper.delete(devopsCdPipelineRecordDTO);
    }

    @Override
    public DevopsCdPipelineRecordDTO queryById(Long id) {
        Assert.notNull(id, PipelineCheckConstant.ERROR_PIPELINE_RECORD_ID_IS_NULL);
        return devopsCdPipelineRecordMapper.selectByPrimaryKey(id);
    }

    @Override
    @Transactional
    public void update(DevopsCdPipelineRecordDTO devopsCdPipelineRecordDTO) {
        devopsCdPipelineRecordDTO.setObjectVersionNumber(devopsCdPipelineRecordMapper.selectByPrimaryKey(devopsCdPipelineRecordDTO.getId()).getObjectVersionNumber());
        if (devopsCdPipelineRecordMapper.updateByPrimaryKeySelective(devopsCdPipelineRecordDTO) != 1) {
            throw new CommonException(ERROR_UPDATE_PIPELINE_RECORD_FAILED);
        }
    }
}
