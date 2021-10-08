// eslint-disable-next-line import/prefer-default-export
export function promisify<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (value: unknown) => void;
} {
  let resolve: (value: T) => void;
  let reject: (value: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
