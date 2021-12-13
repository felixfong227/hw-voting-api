import { Campaign, Prisma } from ".prisma/client";
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { isEmpty, isNil, isString, result } from "lodash";
import { ApiTagNames } from "src/ApiTagNames";
import { HeaderHkidGuard } from "src/auth/header-hkid.guard";
import { CampaignDoesNotExist, CampaignHasExpired, MissingHKIDHashHeader } from "src/Errors";
import { CampaignService } from "./campaign.service";
import {
  CreateNewCampaignDTO,
  CreateNewCampaignResponse,
  GetAllCampaignResponse,
  GetOneCampaignResponse,
} from "./dtos/Campaign.dto";
import {
  CreateNewCampaignOptionDTO,
  GetOneOptionsResponse,
} from "./dtos/Options.dto";
import { GetOneVoteResponse } from "./dtos/Vote.dto";
import { OptionsService } from "./options/options.service";
import { VotesService } from "./votes/votes.service";

class CampaignIdParam {
  @IsNotEmpty()
  @IsUUID()
  campaignID: string;
}

class CaseVoteParams extends CampaignIdParam {}

class CaseVoteBody {
  @IsString()
  @IsNotEmpty()
  @Transform((value) => value.trim())
  @ApiProperty({
    description: "The ID for a poll option that belongs to the campaign",
  })
  optionsID: string;
}

class GetListOfCampainsParams {
  @ApiProperty({
    description: "The limt of result for a single fetch (default=10, max=100)",
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: "The offset of result for a single fetch (default=0)",
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number;
}

@Controller("campaigns")
export class CampaignController {
  constructor(
    private readonly campaignSservice: CampaignService,
    private readonly optionsService: OptionsService,
    private readonly voteService: VotesService
  ) {}

  @Post("/create")
  @ApiTags(ApiTagNames.Campaigns)
  @UseGuards(HeaderHkidGuard)
  @ApiHeader({
    name: "x-hkidhash",
    required: true,
    description: "The hash value of the HKID from a valid user",
    allowEmptyValue: false,
  })
  @ApiCreatedResponse({
    description: "The campaign has been created",
    type: CreateNewCampaignResponse,
  })
  async createOneCampaign(
    @Body() body: CreateNewCampaignDTO,
    @Headers("x-hkidhash") hkidHash: string
  ): Promise<CreateNewCampaignResponse> {
    if (isNil(hkidHash)) {
      throw new MissingHKIDHashHeader();
    }
    const newCampaignRecord = await this.campaignSservice.createNewCampaign(
      body,
      hkidHash
    );
    return {
      ID: newCampaignRecord.ID,
      creation_date: newCampaignRecord.creation_date,
      expire_date: newCampaignRecord.expire_date,
      userHKIDHash: newCampaignRecord.userHKIDHash,
      name: newCampaignRecord.name,
      creator: newCampaignRecord.creator,
      PollOptions: newCampaignRecord.PollOptions,
    };
  }

  @Get("/")
  @ApiTags(ApiTagNames.Campaigns)
  @ApiOkResponse({
    description: "A list of campaigns",
    type: GetAllCampaignResponse,
    isArray: true,
  })
  async getAListOfCampaigns(
    @Query() query: GetListOfCampainsParams,
    @Headers("x-hkidhash") hkidHash: string
  ) {
    const { limit = 10, skip = 0 } = query;
    return this.campaignSservice.getAListOfCampaigns(limit, skip, hkidHash);
  }

  @Get("/:campaignID")
  @ApiTags(ApiTagNames.Campaigns)
  @ApiOkResponse({
    description: "The details of the campaign",
    type: GetOneCampaignResponse,
  })
  async getOneCampaign(@Param() params: CampaignIdParam): Promise<Campaign> {
    const { campaignID: campID } = params;
    const result = await this.campaignSservice.getOneCampaign(campID);
    if (isNil(result)) {
      throw new CampaignDoesNotExist();
    }
    return result;
  }

  @Get("/:campaignID/options")
  @ApiTags(ApiTagNames.PollOptions)
  @ApiOkResponse({
    description: "Get a list of poll options for a campaign",
    type: [GetOneOptionsResponse],
  })
  @ApiNotFoundResponse({
    description: "The campaign does not exist",
  })
  async getCampaignsOptions(@Param() params: CampaignIdParam) {
    const { campaignID: campID } = params;
    const result = await this.optionsService.getOptions(campID);
    if (isEmpty(result)) {
      throw new CampaignDoesNotExist();
    }
    return result;
  }

  @Post("/:campaignID/options")
  @ApiTags(ApiTagNames.PollOptions)
  @UseGuards(HeaderHkidGuard)
  async createCampaignOption(
    @Param() params: CampaignIdParam,
    @Body() body: CreateNewCampaignOptionDTO,
    @Headers("x-hkidhash") hkidHash: string
  ) {
    if (isNil(hkidHash)) {
      throw new MissingHKIDHashHeader();
    }
    const { campaignID } = params;
    const result = this.optionsService.createManyOptions(
      body.pollOptions,
      campaignID,
      hkidHash
    );
    return result;
  }

  @Get("/:campaignID/votes")
  @ApiTags(ApiTagNames.Votes)
  @ApiOkResponse({
    description: "Successfully retrieved all votes for said campaign",
    type: GetOneVoteResponse,
    isArray: true,
  })
  async getVoteByCampaignId(@Param() params: CaseVoteParams) {
    const { campaignID: campID } = params;
    return this.voteService.getVotesForOneCampaign(campID);
  }

  @Post("/:campaignID/votes")
  @ApiTags(ApiTagNames.Votes)
  @UseGuards(HeaderHkidGuard)
  @ApiOkResponse({
    description: "Casted a vote to a campaign",
    type: GetOneVoteResponse,
  })
  @ApiForbiddenResponse({
    description: "Campaign has expired, and will not accept any new votes",
  })
  async caseVote(
    @Param() params: CaseVoteParams,
    @Body() body: CaseVoteBody,
    @Headers("x-hkidhash") hkidHash: string
  ) {
    const { campaignID: campID } = params;
    const { optionsID } = body;

    const isVotingAllowed = await this.voteService.isVotingAllowed(campID);

    if (!isVotingAllowed) {
      throw new CampaignHasExpired();
    }

    const result = await this.voteService.caseAVote(
      campID,
      hkidHash,
      optionsID
    );
    return result;
  }
}
