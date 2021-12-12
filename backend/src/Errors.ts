import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { NotFoundError } from "rxjs";

export class UserAlreadyExistException extends BadRequestException {
  static message = "User already exists";
  constructor() {
    super(UserAlreadyExistException.message);
  }
}

export class MissingHKIDHashHeader extends ForbiddenException {
  static message = "Missing HKID hash header";
  constructor() {
    super(MissingHKIDHashHeader.message);
  }
}

export class MissingRequestParams extends BadRequestException {
  static message = "Missing request params in the URL";
  constructor() {
    super(MissingRequestParams.message);
  }
}

export class CampaignDoesNotExist extends NotFoundException {
  static message = "Campaign does not exist";
  constructor() {
    super(CampaignDoesNotExist.message);
  }
}

export class CampaignHasExpired extends BadGatewayException {
  static message = "Campaign has expired";
  constructor() {
    super(CampaignHasExpired.message);
  }
}

export class DuplicatedCampaignName extends BadRequestException {
  static message = "A campaign with the same name already exists";
  constructor() {
    super(DuplicatedCampaignName.message);
  }
}

export class UserAlreadyVoted extends BadRequestException {
  static message = "User has already voted on this campaign once before";
  constructor() {
    super(UserAlreadyVoted.message);
  }
}

export class PollOptionsDoesNotBelongToCampaign extends BadRequestException {
  static message = "The option you are casting does not belong to this campaign";
  constructor() {
    super(PollOptionsDoesNotBelongToCampaign.message);
  }
}
