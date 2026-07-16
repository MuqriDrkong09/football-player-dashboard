import { render, screen } from '@testing-library/react'
import { DataRefreshingIndicator } from '@/components/feedback/DataRefreshingIndicator'

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useIsFetching: jest.fn(() => 0),
  }
})

import { useIsFetching } from '@tanstack/react-query'

const mockedUseIsFetching = useIsFetching as jest.MockedFunction<
  typeof useIsFetching
>

describe('components/feedback/DataRefreshingIndicator', () => {
  beforeEach(() => {
    mockedUseIsFetching.mockReturnValue(0)
  })

  it('renders nothing when no queries are fetching', () => {
    const { container } = render(<DataRefreshingIndicator />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a top progress bar and Updating status while fetching', () => {
    mockedUseIsFetching.mockReturnValue(1)
    render(<DataRefreshingIndicator />)

    expect(screen.getByRole('status')).toHaveTextContent(/updating/i)
  })
})
