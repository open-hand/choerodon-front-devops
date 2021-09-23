import { AppDeletionWithVertificationStoreProps } from '@/components/app-deletion-with-vertification-code/deletionStore';

type appTypes = 'instance' | 'service' | 'ingress' | 'certificate' | 'configMap' | 'secret' | 'deployGroup'

type openDeleteProps = {
  envId:string
  type?: appTypes
  instanceId:string
  instanceName:string
  callback:(...args:any[])=>any
  deletionStore:AppDeletionWithVertificationStoreProps
}

type activeType = 'stop' | 'start' | 'delete';

export {
  openDeleteProps,
  activeType,
  appTypes,
  AppDeletionWithVertificationStoreProps,
};
