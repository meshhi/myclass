export default async (err, req, res, next) => {
  if (err) {
    console.log(err.message)
  }
  const response = {
    text: 'Error'
  }
  res.json(response);
}