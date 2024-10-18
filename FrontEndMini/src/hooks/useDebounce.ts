import debounce from "lodash.debounce";
import { useRef } from "react";

const useDebounce = (fn: (...args: never[]) => void, delay: number) => {
  const debouncedFn = useRef(debounce(fn, delay));
  return debouncedFn.current;
};

export default useDebounce;
