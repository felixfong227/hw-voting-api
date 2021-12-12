import { ApiProperty } from "@nestjs/swagger";

export class ApiSingleErrorResponse {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  error: string;
}
