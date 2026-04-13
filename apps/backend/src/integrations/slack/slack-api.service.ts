import { Injectable } from '@nestjs/common';

export type TSlackChannel = {
  id: string;
  name: string;
  is_private: boolean;
  num_members: number;
};

/**
 * Slack Web API client.
 *
 * Stateless — the bot token is passed per-call since each company
 * has its own token stored in TCompanyIntegration.config.bot_token.
 */
@Injectable()
export class SlackApiService {
  /**
   * Search channels by name prefix.
   * Fetches all conversations the bot can see, then filters client-side by query.
   * Slack's conversations.list doesn't support server-side name filtering.
   */
  async searchChannels(botToken: string, query: string): Promise<TSlackChannel[]> {
    const channels: TSlackChannel[] = [];
    let cursor: string | undefined;
    const normalizedQuery = query.toLowerCase();

    // Paginate through all channels (max 2 pages for performance)
    for (let page = 0; page < 2; page++) {
      const params = new URLSearchParams({
        types: 'public_channel,private_channel',
        exclude_archived: 'true',
        limit: '200',
      });
      if (cursor) params.set('cursor', cursor);

      const response = await fetch(
        `https://slack.com/api/conversations.list?${params.toString()}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${botToken}` },
        },
      );

      const data = (await response.json()) as {
        ok: boolean;
        channels?: Array<{
          id: string;
          name: string;
          is_private: boolean;
          num_members: number;
        }>;
        response_metadata?: { next_cursor?: string };
        error?: string;
      };

      if (!data.ok || !data.channels) {
        throw new Error(`SLACK_API_ERROR: ${data.error ?? 'unknown'}`);
      }

      channels.push(
        ...data.channels.map((ch) => ({
          id: ch.id,
          name: ch.name,
          is_private: ch.is_private,
          num_members: ch.num_members,
        })),
      );

      cursor = data.response_metadata?.next_cursor;
      if (!cursor) break;
    }

    // Filter by query
    if (!normalizedQuery) return channels;
    return channels.filter((ch) => ch.name.toLowerCase().includes(normalizedQuery));
  }

  /**
   * Create a Slack channel. Returns the created channel info.
   * Normalizes the name: lowercase, spaces → hyphens, strips special chars.
   */
  async createChannel(botToken: string, name: string, isPrivate: boolean): Promise<TSlackChannel> {
    const normalizedName = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!normalizedName) {
      throw new Error('SLACK_CREATE_CHANNEL_FAILED: invalid_name');
    }

    const response = await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: normalizedName, is_private: isPrivate }),
    });

    const data = (await response.json()) as {
      ok: boolean;
      channel?: { id: string; name: string; is_private: boolean; num_members: number };
      error?: string;
    };

    // If channel name already exists, find and return the existing one
    if (!data.ok && data.error === 'name_taken') {
      const existing = await this.searchChannels(botToken, normalizedName);
      const match = existing.find((ch) => ch.name === normalizedName);
      if (match) return match;
      throw new Error('SLACK_CREATE_CHANNEL_FAILED: name_taken_but_not_found');
    }

    if (!data.ok || !data.channel) {
      throw new Error(`SLACK_CREATE_CHANNEL_FAILED: ${data.error ?? 'unknown'}`);
    }

    return {
      id: data.channel.id,
      name: data.channel.name,
      is_private: data.channel.is_private,
      num_members: data.channel.num_members,
    };
  }
}
