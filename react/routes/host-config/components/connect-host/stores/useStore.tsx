import { useLocalStore } from 'mobx-react-lite';

export default function useStore({
  defaultType,
  defaultStep,
}: { defaultType: string, defaultStep: string }) {
  return useLocalStore(() => ({
    currentType: defaultType,
    setCurrentType(key:string) {
      this.currentType = key;
    },
    get getCurrentType() {
      return this.currentType;
    },

    currentStep: defaultStep,
    setCurrentStep(key: string) {
      this.currentStep = key;
    },
    get getCurrentStep() {
      return this.currentStep;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
