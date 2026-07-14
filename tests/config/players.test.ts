import { PLAYER_POSITIONS, PLAYERS_PER_PAGE } from '@/config/players'

describe('config/players', () => {
  it('lists supported positions', () => {
    expect(PLAYER_POSITIONS).toEqual([
      'Goalkeeper',
      'Defender',
      'Midfielder',
      'Attacker',
    ])
  })

  it('defines page size', () => {
    expect(PLAYERS_PER_PAGE).toBe(20)
  })
})
