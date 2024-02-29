export type ObjectOverrides<TVariables> = {
  [K in keyof TVariables & string]?: TVariables[K] | OverrideFunction<TVariables[K]>
} 

type OverrideFunction<T> = ((prev: T) => T)

function isOverrideFunction<T>(value: T | OverrideFunction<T>): value is OverrideFunction<T> {
  return typeof value === "function";
} 

function getOverrideValue<T>(initial: T, override?: T | OverrideFunction<T>) {
  if(!override) {
    return initial;
  }

  if(isOverrideFunction(override)) {
    return override(initial);
  }

  return override;
}

function getUnqiueKeysSet(...args: Record<string, any>[]) {
  const keys = args.map((obj) => Object.keys(obj)).flat();
  return Array.from(new Set(keys));
}

function mergeOverrides<T extends Record<string, any>>(initial: T, overrides?: ObjectOverrides<T>) {
  if(!overrides) {
    return initial;
  }

  const keySet = getUnqiueKeysSet(initial, overrides);

  return keySet.reduce((result, key) => {
    const value = getOverrideValue(initial[key], overrides[key])
    return Object.assign(result, { [key]: value });
  }, {}) as T;
}

export { mergeOverrides };