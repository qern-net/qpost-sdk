/**
 * Thrown for any non-2xx response from the QPost API. `code` is the machine-readable `error` field
 * from the QPost error body ({@code {"error": "...", "message": "..."}}); `status` is the HTTP status.
 */
export class QPostApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "QPostApiError";
    this.status = status;
    this.code = code;
  }
}
