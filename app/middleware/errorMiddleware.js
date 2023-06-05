module.exports = async (err, req, res, next) => {
  if (err) {
    console.log(err.message)
  }
  res.status = err.code;
  const response = {
    text: err.message
  }
  res.json(response);
}