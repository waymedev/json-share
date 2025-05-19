export class HttpError extends Error {
    public status: number;
    public errors?: any;  
  
    constructor(status: number, message: string, errors?: any) {
      super(message);
      this.status = status;
      this.errors = errors;
      // 保留原型链
      Object.setPrototypeOf(this, HttpError.prototype);
    }
}