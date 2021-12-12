import { ApiProperty } from "@nestjs/swagger";
import { PollOptions } from "@prisma/client";
import { CreateNewUserResponse } from "src/users/createNewUser.dto";
import { GetOneOptionsResponse } from "./Options.dto";

export class GetOneVoteResponse {
  @ApiProperty()
  ID: string;
  @ApiProperty()
  vote_date: Date;
  @ApiProperty()
  userHKIDHash: string;
  @ApiProperty()
  campaignID: string;
  @ApiProperty()
  pollOptionsID: string;
  @ApiProperty()
  voter: CreateNewUserResponse;
  @ApiProperty()
  option: GetOneOptionsResponse;
}
