module.exports = async (err, req, res, next) => {
  if (err) {
    console.log(err.message)
  }
  res.statusCode = err.code ? err.code : 500;
  const response = {
    text: err.message
  }
  res.json(response);
}