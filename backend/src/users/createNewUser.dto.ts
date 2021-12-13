import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, Matches, MinLength, Validate } from "class-validator";
import { IsHKID } from "src/Utils/validators/IsHKID";

export class CreateNewUserDTO {
  @IsString()
  @Transform((value) => value.toUpperCase())
  @MinLength(8, {
    message: "HKID must have at least 8 characters long",
  })
  @Matches(/(.*)(\(\d|\w\))/, {
    message: "incorrect HKID format",
  })
  @Validate(IsHKID, {
    message: "Malformed HKID",
  })
  @ApiProperty({
    example: "A123456(7)",
  })
  HKID: string;
}

export class CreateNewUserResponse {
  @ApiProperty({
    description: "A SHA256 hash of the input HKID",
  })
  HKIDHash: string;
  @ApiProperty()
  join_date: Date;
}
