import { Injectable, Logger } from "@nestjs/common";
import { PrismaServiceV2 } from "src/prisma/prisma.service";
import { MakePollOptionsCompositeId } from "src/Utils/validators/MakePollOptionsComId";
import { CreateNewCampaignOption } from "../dtos/Options.dto";

@Injectable()
export class OptionsService {
  constructor(private readonly prisma: PrismaServiceV2) {}

  async getOptions(campaignID: string) {
    return this.prisma.pollOptions.findMany({
      where: {
        campaignID,
      },
      include: {
        creator: true,
      },
    });
  }

  async createManyOptions(
    options: CreateNewCampaignOption[],
    campaignID: string,
    HKIDHash: string
  ) {
    const records = await this.prisma.pollOptions.createMany({
      skipDuplicates: true,
      data: options.map((options) => {
        return {
          ID: MakePollOptionsCompositeId(campaignID, options.name),
          name: options.name,
          campaignID,
          userHKIDHash: HKIDHash,
        };
      }),
    });
    Logger.log(
      `Created ${records.count} new options for campaign ${campaignID} by user ${HKIDHash}`
    );
    return this.prisma.pollOptions.findMany({
      where: {
        campaignID,
        name: {
          in: options.map((option) => option.name),
        },
      },
    });
  }
}
