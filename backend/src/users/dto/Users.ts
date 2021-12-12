import { ApiProperty } from "@nestjs/swagger";
import { GetAllCampaignResponse } from "src/campaign/dtos/Campaign.dto";
import { GetOneVoteResponse } from "src/campaign/dtos/Vote.dto";

export class GetOneUserDetailsResponse {
  @ApiProperty()
  HKIDHash: string;
  @ApiProperty()
  join_date: Date;
  @ApiProperty({
    type: GetAllCampaignResponse,
    isArray: true,
  })
  Campaign: GetAllCampaignResponse[];
  @ApiProperty({
    type: GetOneVoteResponse,
    isArray: true,
  })
  Vote: GetOneVoteResponse[];
}
