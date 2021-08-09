import useCurrentServices from './useCurrentServices';

const useHasMarket = () => {
  const services = useCurrentServices();
  return services.includes('market-service');
};

export default useHasMarket;
