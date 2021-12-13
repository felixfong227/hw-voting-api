import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { CreateNewUserResponse } from "src/users/createNewUser.dto";

export class GetOneOptionsResponse {
  @ApiProperty()
  ID: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description?: string;
  @ApiProperty()
  creation_date: Date;
  @ApiProperty()
  userHKIDHash: string;
  @ApiProperty()
  campaignID: string;
  @ApiProperty()
  creator: CreateNewUserResponse;
}

export class CreateNewCampaignOption {
  @ApiProperty({
    description: "The name of the poll option",
  })
  @IsString()
  @MaxLength(30, {
    message: "The name of the poll option must be less than 30 characters",
  })
  @Transform((value) => value.trim())
  @IsNotEmpty()
  name: string;
}

export class CreateNewCampaignOptionDTO {
  @ApiProperty({
    type: CreateNewCampaignOption,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateNewCampaignOption)
  @IsArray()
  @ArrayMinSize(1, {
    message: "At least one option must be provided",
  })
  pollOptions: CreateNewCampaignOption[];
}
