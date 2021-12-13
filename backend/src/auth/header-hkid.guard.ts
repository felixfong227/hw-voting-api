import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isNil } from "lodash";
import { PrismaServiceV2 } from "src/prisma/prisma.service";

@Injectable()
export class HeaderHkidGuard implements CanActivate {
  
  constructor(
    private readonly prisma: PrismaServiceV2,
  ) {}
  
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const HKIDHash: string = req.headers?.["x-hkidhash"];
    
    const userRecord = await this.prisma.user.findFirst({
      where: {
        HKIDHash,
      }
    });

    // the incoming request didn't provied a header "X-HKIDHash"
    if (isNil(HKIDHash)) {
      return false;
    }
    
    if(isNil(userRecord)) {
      return false;
    }

    return true;

  }
}
