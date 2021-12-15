const DEFAULT_TMP_ID = 0;

const DEFAULT_STAGE_TMP = {
  id: '=7eYjQcsxANwFRM3iacWdzw===',
  name: '',
  sequence: null,
  ciTemplateJobVOList: [{
    id: '=dsadsadsadsa===',
    image: null,
    name: '',
  }],
};

const DEFAULT_TMP = {
  id: DEFAULT_TMP_ID,
  builtIn: true,
  ciTemplateCategoryId: DEFAULT_TMP_ID,
  enable: 1,
  image: null,
  name: '空白模板',
  sourceId: 0,
  sourceType: 'site',
  versionName: null,
  ciTemplateStageVOList: new Array(4).fill(DEFAULT_STAGE_TMP),
} as const;

export {
  DEFAULT_TMP,
};
