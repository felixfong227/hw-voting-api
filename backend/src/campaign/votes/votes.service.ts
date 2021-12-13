import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as dayjs from "dayjs";
import { isEmpty, isNil } from "lodash";
import { PollOptionsDoesNotBelongToCampaign, UserAlreadyVoted } from "src/Errors";
import { PrismaServiceV2 } from "src/prisma/prisma.service";

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaServiceV2) {}

  async getVotesForOneCampaign(campaignID: string) {
    if (isNil(campaignID)) {
      return new BadRequestException("Campaign ID is required");
    }

    const result = await this.prisma.vote.findMany({
      where: {
        campaignID,
      },
      include: {
        voter: true,
        option: {
          include: {
            creator: true,
          },
        },
      },
    });
    return result;
  }

  async isVotingAllowed(campaignID: string): Promise<boolean> {
    // check if the campaign is still open (not closed or expired)
    const campaignExpireDate = await this.prisma.campaign.findFirst({
      select: {
        expire_date: true,
      },
      where: {
        ID: campaignID,
      },
    });
    const today = dayjs();
    const campaignExpireDateDayjs = dayjs(campaignExpireDate.expire_date);
    Logger.log(today, campaignExpireDateDayjs);
    return today.isBefore(campaignExpireDateDayjs);
  }

  async caseAVote(campaignID: string, userHKIDHash: string, optionsID: string) {
    // check if user has already voted
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        campaignID,
        voter: {
          HKIDHash: userHKIDHash,
        },
      },
    });

    if (!isEmpty(existingVote)) {
      throw new UserAlreadyVoted();
    }

    const isOptionBelongToCampaign = await this.prisma.pollOptions.findFirst({
      where: {
        ID: optionsID,
        Campaign: {
          ID: campaignID,
        }
      },
      select: {
        ID: true,
      }
    });

    if (isNil(isOptionBelongToCampaign)) {
      throw new PollOptionsDoesNotBelongToCampaign();
    }

    // casting a vote on behalf of this user
    const result = await this.prisma.vote.create({
      data: {
        campaign: {
          connect: {
            ID: campaignID,
          },
        },
        voter: {
          connect: {
            HKIDHash: userHKIDHash,
          },
        },
        option: {
          connect: {
            ID: optionsID,
          },
        },
      },
      include: {
        voter: true,
        option: {
          include: {
            creator: true,
          },
        },
      },
    });
    return result;
  }
}
