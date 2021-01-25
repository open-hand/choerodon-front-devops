import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    listHasMore: false,
    get getListHasMore() {
      return this.listHasMore;
    },
    setListHasMore(flag:boolean) {
      this.listHasMore = flag;
    },
    currentTabKey: 'distribute_test',
    setCurrentTabKey(key:string) {
      this.currentTabKey = key;
    },
    get getCurrentTabKey() {
      return this.currentTabKey;
    },
  }));
}
