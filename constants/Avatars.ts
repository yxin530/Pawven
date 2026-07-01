// Random cat profile pics for avatars throughout the app
// Use getRandomAvatar(index) for deterministic random based on index
// Use getVetAvatar() for vet accounts

const RANDOM_PROFILES = [
  require('@/assets/images/randomProfile1.jpg'),
  require('@/assets/images/randomProfile2.jpg'),
  require('@/assets/images/randomProfile3.jpg'),
  require('@/assets/images/randomProfile4.jpg'),
  require('@/assets/images/randomProfile5.jpg'),
  require('@/assets/images/randomProfile6.jpg'),
];

const VET_PROFILE = require('@/assets/images/vetProfilepic.png');

export function getRandomAvatar(index: number = 0) {
  return RANDOM_PROFILES[index % RANDOM_PROFILES.length];
}

export function getVetAvatar() {
  return VET_PROFILE;
}

export function getAvatarForType(type: string, index: number = 0) {
  if (type === 'vet') return VET_PROFILE;
  return RANDOM_PROFILES[index % RANDOM_PROFILES.length];
}

export { RANDOM_PROFILES, VET_PROFILE };
