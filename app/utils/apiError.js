class ApiError extends Error {
  constructor(code, message) {
    super();
    this.code = code;
    this.message = message;
  }
}

export default ApiError;