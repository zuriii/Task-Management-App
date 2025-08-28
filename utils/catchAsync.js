// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  return (req, res, next) => {
    console.log("catchasync");
    fn(req, res, next).catch(next);
  };
};
