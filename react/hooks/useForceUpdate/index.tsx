import { useCallback, useState } from 'react';

function useForceUpdate() {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);
}

export default useForceUpdate;
