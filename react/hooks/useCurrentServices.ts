import { stores } from '@choerodon/boot';
import { useObserver } from 'mobx-react-lite';

const { AppState } = stores;
const useCurrentServices = () => (
  useObserver(() => (AppState.menuType.categories
    ? AppState.currentServices.map((c: any) => c.serviceCode)
    : [])));

export default useCurrentServices;
