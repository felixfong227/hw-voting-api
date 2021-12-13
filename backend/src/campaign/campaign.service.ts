import { Campaign } from ".prisma/client";
import { Injectable } from "@nestjs/common";
import { isNil, isNumber, uniq } from "lodash";
import { DuplicatedCampaignName, FoundDuplicatedPollOptions } from "src/Errors";
import { PrismaServiceV2 } from "src/prisma/prisma.service";
import { CreateNewCampaignDTO } from "./dtos/Campaign.dto";
import { v4 as uuidv4 } from 'uuid';
import { MakePollOptionsCompositeId } from "src/Utils/validators/MakePollOptionsComId";

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaServiceV2) {}

  async createNewCampaign(dto: CreateNewCampaignDTO, HKIDHash: string) {
    const { name, expireDate, pollOptions } = dto;

    // check if this user have the same campaign name already
    const oldCampaign = await this.prisma.campaign.findFirst({
      where: {
        name: name,
        userHKIDHash: HKIDHash,
      },
      select: {
        ID: true,
      },
    });

    if (!isNil(oldCampaign)) {
      throw new DuplicatedCampaignName();
    }
    
    // check if the options is unique
    const uniqueOptions = uniq(pollOptions);
    
    if(uniqueOptions.length !== pollOptions.length) {
      throw new FoundDuplicatedPollOptions();
    }
    
    const campaignID = uuidv4();

    return await this.prisma.campaign.create({
      data: {
        ID: campaignID,
        expire_date: expireDate,
        name,
        creator: {
          connect: {
            HKIDHash,
          },
        },
        PollOptions: {
          createMany: {
            data: pollOptions.map((option) => {
              return {
                ID: MakePollOptionsCompositeId(campaignID, option.name),
                name: option.name,
                userHKIDHash: HKIDHash,
              }
            }),
          }
        }
      },
      include: {
        creator: true,
        PollOptions: {
          include: {
            creator: true,
          }
        }
      }
    });
  }

  async getAListOfCampaigns(
    limit: number | string,
    skip: number | string
  ): Promise<Campaign[]> {
    const intLimit = isNumber(limit) ? limit : parseInt(limit);
    const intSkip = isNumber(skip) ? skip : parseInt(skip);

    const results = await this.prisma.campaign.findMany({
      skip: intSkip,
      take: intLimit,
      include: {
        creator: true,
      },
    });
    return results;
  }

  async getOneCampaign(campaignID: string): Promise<Campaign> {
    return await this.prisma.campaign.findFirst({
      where: {
        ID: campaignID,
      },
      include: {
        creator: true,
        Vote: {
          include: {
            voter: true,
            option: {
              include: {
                creator: true,
              },
            },
          },
        },
        PollOptions: {
          include: {
            creator: true,
          },
        },
      },
    });
  }
}
