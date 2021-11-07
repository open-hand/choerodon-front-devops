import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/master';
import { handlePromptError } from '@/utils';

export default function useStore() {
  return useLocalStore(() => ({
  }));
}
