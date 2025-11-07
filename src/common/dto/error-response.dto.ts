export class ErrorResponseDto {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  message: string[];
}
