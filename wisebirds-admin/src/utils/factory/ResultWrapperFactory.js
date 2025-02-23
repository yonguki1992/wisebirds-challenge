export class ResultWrapperFactory {
  /**
   *  @typedef {function (T): Type.ResultWrapper<T>} ResultWrapperFactory.Create<T>
   *  @template T
   */
  /**
   *  @param {Partial<T>} [props]
   *  @return {Type.ResultWrapper<T>}
   *  @template T
   */
  static create(props) {
    if (typeof props === "object" && props !== null) {
      return { result: false, ...props };
    }
    return { result: false };
  }
}