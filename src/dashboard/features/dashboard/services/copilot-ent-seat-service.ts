import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ensureGitHubEnvConfig } from "./env-service";

export interface CopilotSeatUser {
  name: string | null;
  email: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at: string;
  user_view_type: string;
}

export interface CopilotOrganization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string | null;
}

export interface CopilotOrganizationTeam {
  id: number;
  node_id: string;
  name: string;
  slug: string;
  description: string | null;
  privacy: string;
  notification_setting: string;
  permission: string;
  permissions: {
    pull: boolean;
    triage: boolean;
    push: boolean;
    maintain: boolean;
    admin: boolean;
  };
  url: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
  parent: TeamSimple | null;
}

export interface TeamSimple {
  id: number;
  node_id: string;
  url: string;
  members_url: string;
  name: string;
  description: string | null;
  permission: string;
  html_url: string;
  repositories_url: string;
  slug: string;
  ldap_dn: string;
}

export interface EnterpriseTeam {
  id: number;
  name: string;
  slug: string;
  url: string;
  sync_to_organizations: string;
  group_id: number | null;
  html_url: string;
  members_url: string;
  created_at: string;
  updated_at: string;
}

export interface CopilotSeatDetail {
  assignee: CopilotSeatUser;
  organization: CopilotOrganization | null;
  assigning_team: CopilotOrganizationTeam | EnterpriseTeam | null;
  pending_cancellation_date: string | null;
  last_activity_at: string | null;
  last_activity_editor: string | null;
  created_at: string;
  updated_at: string;
  plan_type: "business" | "enterprise" | "unknown";
}

export interface CopilotSeatsResponse {
  total_seats: number;
  seats: CopilotSeatDetail[];
}

export const getCopilotSeatsForEnterprise = async (): Promise<ServerActionResponse<CopilotSeatsResponse>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/enterprises/${enterprise}/copilot/billing/seats`,
      {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      }
    );

    if (!response.ok) {
      return formatResponseError(enterprise, response);
    }

    const data = await response.json();

    return {
      status: "OK",
      response: data as CopilotSeatsResponse
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};