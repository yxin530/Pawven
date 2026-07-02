/**
 * Simple in-memory follow store.
 * Tracks which orgs/communities the user is following.
 * Persists for the session (resets on app restart).
 */

const followedIds = new Set<string>();

export function followOrg(id: string) {
  followedIds.add(id);
}

export function unfollowOrg(id: string) {
  followedIds.delete(id);
}

export function isFollowingOrg(id: string): boolean {
  return followedIds.has(id);
}

export function toggleFollow(id: string): boolean {
  if (followedIds.has(id)) {
    followedIds.delete(id);
    return false;
  }
  followedIds.add(id);
  return true;
}

export function getFollowedIds(): string[] {
  return Array.from(followedIds);
}
