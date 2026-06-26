/**
 * Pawven Color Palette
 * Warm, nature-toned colors aligned with the animal welfare mission.
 */

export interface ColorPalette {
  /** Deep forest green — primary brand color */
  primary: string;
  /** Warm brown — secondary accent */
  secondary: string;
  /** Cream — app background */
  background: string;
  /** Light sage — card/surface backgrounds */
  surface: string;
  /** Warm orange — call-to-action accent */
  accent: string;
  /** Dark charcoal — primary text */
  text: string;
  /** Muted olive — secondary/supporting text */
  textSecondary: string;
  /** Soft tan — borders and dividers */
  border: string;
  /** Vibrant green — active/success states */
  active: string;
  /** Muted gray — disabled/inactive states */
  disabled: string;
}

export const Colors: ColorPalette = {
  primary: '#2D5016',
  secondary: '#8B4513',
  background: '#FFF8F0',
  surface: '#E8F0E0',
  accent: '#E8740C',
  text: '#1A1A1A',
  textSecondary: '#5C6B4A',
  border: '#D4C5A0',
  active: '#4CAF50',
  disabled: '#B0B0B0',
};

export default Colors;
