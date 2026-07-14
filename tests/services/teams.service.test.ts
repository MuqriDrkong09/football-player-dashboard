jest.mock('@/api/client', () => ({
  apiGet: jest.fn(),
}))

import { apiGet } from '@/api/client'
import { getTeams } from '@/services/teams.service'
import { createTeam } from '../fixtures/players'

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>

describe('services/teams.service', () => {
  it('fetches teams with optional params', async () => {
    const payload = {
      data: [createTeam()],
      results: 1,
      paging: { current: 1, total: 1 },
    }
    mockedApiGet.mockResolvedValueOnce(payload)

    await expect(getTeams({ league: 39, season: 2024 })).resolves.toEqual(
      payload,
    )
    expect(mockedApiGet).toHaveBeenCalledWith('/teams', {
      league: 39,
      season: 2024,
    })
  })
})
