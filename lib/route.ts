import "server-only";
import { getAccess, getActivePlan, getProfile } from "./access";

/** Where a returning signed-in person belongs: the app if paid, their locked plan if not, the flow if no plan yet. */
export async function landingRedirect(): Promise<string> {
  const [access, plan] = await Promise.all([getAccess(), getActivePlan()]);
  if (access.kwop.paid) return plan ? "/dashboard" : "/start";
  if (plan) return "/plan";
  const profile = await getProfile();
  return profile ? "/start" : "/signup";
}
