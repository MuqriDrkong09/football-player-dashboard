export const PLAYER_POSITIONS = [
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Attacker',
] as const

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number]

export const PLAYERS_PER_PAGE = 20
