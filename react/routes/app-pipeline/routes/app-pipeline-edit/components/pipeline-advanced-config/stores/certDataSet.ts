import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';

const mapping: any = {
  repoAddress: {
    name: 'domain',
    type: 'string',
    label: '镜像仓库域名',
    dynamicProps: {
      required: ({ record }: any) => record?.get(mapping.username.name)
        || record?.get(mapping.repoAddress.name)
        || record?.get(mapping.password.name),
    },
    validator: (value: any, name: any, record: any) => {
      const dataSet = record?.dataSet;
      const sameLength = dataSet?.toData()
        .filter((i: any) => i?.[mapping.repoAddress.name] === value)?.length;
      if (sameLength && sameLength >= 2) {
        return '镜像仓库域名不能重复';
      }
      return true;
    },
  },
  username: {
    name: 'username',
    type: 'string',
    label: '用户名',
    dynamicProps: {
      required: ({ record }: any) => record?.get(mapping.username.name)
        || record?.get(mapping.repoAddress.name)
        || record?.get(mapping.password.name),
    },
  },
  password: {
    name: 'password',
    type: 'string',
    label: '密码',
    dynamicProps: {
      required: ({ record }: any) => record?.get(mapping.username.name)
        || record?.get(mapping.repoAddress.name)
        || record?.get(mapping.password.name),
    },
  },
};

const setTabData = async (ds: any, setData: any, origin: any, setFunc: any) => {
  const data = ds?.toData().filter((d: any) => JSON.stringify(d) !== '{}');
  const flag = await ds.validate();
  setFunc(TAB_ADVANCE_SETTINGS, {
    ciDockerAuthConfigDTOList: data,
    authFlag: flag,
  });
};

const Index = (data: any, setData: any, setDataFunc: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
  events: {
    create: ({ dataSet }: any) => {
      if (dataSet?.length === 1) {
        if (data?.ciDockerAuthConfigDTOList && data?.ciDockerAuthConfigDTOList?.length > 0) {
          dataSet.loadData(data?.ciDockerAuthConfigDTOList);
        }
      }
      setTabData(dataSet, setData, data, setDataFunc);
    },
    update: ({ dataSet }: any) => {
      setTabData(dataSet, setData, data, setDataFunc);
    },
    remove: ({ dataSet }: any) => {
      setTabData(dataSet, setData, data, setDataFunc);
    },
  },
});

export default Index;

export {
  mapping,
};
