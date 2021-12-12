import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { isNil } from "lodash";
import { UserAlreadyExistException } from "src/Errors";
import { PrismaServiceV2 } from "src/prisma/prisma.service";
import { CreateNewUserResponse } from "./createNewUser.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaServiceV2) {}

  async createNewUser(HKID: string): Promise<CreateNewUserResponse> {
    const HKIDHash = createHash("sha256").update(HKID).digest("hex");
    const existingUserRecord = await this.prisma.user.findFirst({
      where: {
        HKIDHash,
      },
      select: {
        HKIDHash: true,
      },
    });
    if (!isNil(existingUserRecord)) {
      throw new UserAlreadyExistException();
    }
    const newRecord = await this.prisma.user.create({
      data: {
        HKIDHash,
        join_date: new Date(),
      },
    });
    return newRecord;
  }

  async getOneUser(HKIDHash: string) {
    return this.prisma.user.findFirst({
      where: {
        HKIDHash,
      },
      include: {
        Campaign: {
          include: {
            creator: true,
          },
        },
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
      },
    });
  }
}
