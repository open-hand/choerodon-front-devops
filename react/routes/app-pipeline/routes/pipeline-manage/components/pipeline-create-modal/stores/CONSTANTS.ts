export const DEFAULT_TMP_ID = 0;

const getDefaultStageTmp = (id:number) => ({
  id: `0${id}`,
  name: '',
  sequence: null,
  ciTemplateJobVOList: [{
    id: '0',
    image: null,
    name: '',
  }],
});

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
  ciTemplateStageVOList: new Array(4).fill(0).map((_data, index) => getDefaultStageTmp(index)),
} as const;

export {
  DEFAULT_TMP,
};
