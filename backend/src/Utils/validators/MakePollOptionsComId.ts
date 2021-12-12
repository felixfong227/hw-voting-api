import { createHash } from "crypto";

export function MakePollOptionsCompositeId(
  campaignID: string,
  pollName: string
): string {
  return createHash("sha256").update(campaignID).update(pollName).digest("hex");
}
