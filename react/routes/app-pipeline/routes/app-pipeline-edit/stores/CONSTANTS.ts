const TAB_BASIC = 'basicInfo' as const;
const TAB_FLOW_CONFIG = 'flowConfiguration' as const;
const TAB_CI_CONFIG = 'ciConfigs' as const;
const TAB_ADVANCE_SETTINGS = 'advancedSettings' as const;

const tabsGroup = [TAB_BASIC, TAB_FLOW_CONFIG, TAB_CI_CONFIG, TAB_ADVANCE_SETTINGS] as const;

const STAGE_CI = 'CI' as const;

const STAGE_CD = 'CD' as const;

const DEFAUTL_CD_STAGE = [{
  name: '部署', sequence: 3, type: 'CD',
}];

// 空白得分组
const DEFAULT_STAGES_DATA = {
  devopsCiStageVOS: [
    {
      name: '代码扫描', sequence: 1, type: 'CI',
    },
    {
      name: '构建', sequence: 2, type: 'CI',
    },
  ],
  hasRecords: false,
  name: '默认模板',
} as const;

export {
  DEFAULT_STAGES_DATA,
  DEFAUTL_CD_STAGE,
};

export {
  TAB_BASIC,
  TAB_FLOW_CONFIG,
  TAB_CI_CONFIG,
  TAB_ADVANCE_SETTINGS,
  tabsGroup,

  STAGE_CD,
  STAGE_CI,
};
