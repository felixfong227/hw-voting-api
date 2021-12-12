import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isNil } from "lodash";
import { Observable } from "rxjs";

@Injectable()
export class HeaderHkidGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const HKIDHash: string = req.headers?.["x-hkidhash"];

    // the incoming request didn't provied a header "X-HKIDHash"
    if (isNil(HKIDHash)) {
      return false;
    }
    return true;
  }
}
