/**
 * 非同步錯誤擷取包裝器 (Async Error Catching Wrapper)
 * 用於簡化 Express 路由中的 try-catch 結構。
 * 
 * @param {Function} fn 非同步路由處理函式
 * @returns {Function} Express 路由處理函式
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
