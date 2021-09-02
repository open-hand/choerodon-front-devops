import { instanceMappingsType } from '../interface';

type mappingobjProps = {
  [field in instanceMappingsType]: {
    icon: string;
    name: string;
  };
};

const instanceMappings:mappingobjProps = {
  instanceCount: {
    icon: 'instance_outline',
    name: 'Chart',
  },
  serviceCount: {
    icon: 'router',
    name: 'Service',
  },
  ingressCount: {
    icon: 'language',
    name: 'Ingress',
  },
  certificationCount: {
    icon: 'class',
    name: '',
  },
  configMapCount: {
    icon: 'compare_arrows',
    name: 'ConfigMap',
  },
  secretCount: {
    icon: 'vpn_key',
    name: 'Secret',
  },
  workloadCount: {
    icon: 'swap_horizontal_circle-o',
    name: 'WorkLoad',
  },
  podCount: {
    icon: 'fiber_manual_record-o',
    name: '',
  },
};
export {
  instanceMappings,
};
