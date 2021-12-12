import { Campaign } from ".prisma/client";
import { Injectable } from "@nestjs/common";
import { isNil, isNumber } from "lodash";
import { DuplicatedCampaignName } from "src/Errors";
import { PrismaServiceV2 } from "src/prisma/prisma.service";
import { CreateNewCampaignDTO } from "./dtos/Campaign.dto";

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaServiceV2) {}

  async createNewCampaign(dto: CreateNewCampaignDTO, HKIDHash: string) {
    const { name, expireDate } = dto;

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

    return await this.prisma.campaign.create({
      data: {
        expire_date: expireDate,
        name,
        creator: {
          connect: {
            HKIDHash,
          },
        },
      },
      include: {
        creator: true,
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
