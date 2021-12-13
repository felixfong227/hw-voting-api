import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
  ValidateNested,
} from "class-validator";
import { CreateNewUserResponse } from "src/users/createNewUser.dto";
import {
  isExpireDateBeforeToday,
  IsExpireDateInRange,
} from "src/Utils/validators/IsExpired";
import { CreateNewCampaignOption, GetOneOptionsResponse } from "./Options.dto";
import { GetOneVoteResponse } from "./Vote.dto";

export class CreateNewCampaignDTO {
  @ApiProperty({
    description: "The name of this campaign",
  })
  @IsString()
  @MaxLength(50, {
    message: "Campaign name too long, length < 50",
  })
  @Transform((value) => value.trim())
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "The expire date of this campaign(no more then 1 week)",
  })
  @IsDateString()
  @Validate(IsExpireDateInRange)
  @Validate(isExpireDateBeforeToday)
  @IsNotEmpty()
  expireDate: Date;
  
  @ApiProperty({
    type: CreateNewCampaignOption,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateNewCampaignOption)
  @IsArray()
  @ArrayMinSize(2, {
    message: "At least two option must be provided",
  })
  pollOptions: CreateNewCampaignOption[];
}

export class CreateNewCampaignResponse {
  @ApiProperty()
  ID: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  expire_date: Date;
  @ApiProperty()
  creation_date: Date;
  @ApiProperty()
  userHKIDHash: string;
  @ApiProperty()
  creator: CreateNewUserResponse;
  @ApiProperty({
    type: GetOneOptionsResponse,
    isArray: true,
  })
  PollOptions: GetOneOptionsResponse[];
}

export class GetOneCampaignResponse {
  @ApiProperty()
  ID: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  creation_date: Date;
  @ApiProperty()
  expire_date: Date;
  @ApiProperty()
  userHKIDHash: Date;
  @ApiProperty()
  creator: CreateNewUserResponse;
  @ApiProperty({
    type: [GetOneVoteResponse],
  })
  Vote: GetOneVoteResponse[];
  @ApiProperty({
    type: [GetOneOptionsResponse],
  })
  PollOptions: GetOneOptionsResponse[];
}

export class GetAllCampaignResponse {
  @ApiProperty()
  ID: string;
  @ApiProperty()
  creation_date: string;
  @ApiProperty()
  expire_date: string;
  @ApiProperty()
  userHKIDHash: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  creator: CreateNewUserResponse;
}
