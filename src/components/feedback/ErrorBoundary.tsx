import { AlertTriangle } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { RetryButton } from '@/components/feedback/RetryButton'
import { notify } from '@/lib/notify'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
    notify.error(
      'Unexpected error',
      error.message || 'An unexpected error occurred while rendering this page.',
    )
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    notify.info('Section reloaded')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <EmptyState
          icon={AlertTriangle}
          title="Something went wrong"
          description={
            this.state.error?.message ??
            'An unexpected error occurred while rendering this page.'
          }
          action={
            <RetryButton onRetry={this.handleReset} label="Reload section" />
          }
        />
      )
    }

    return this.props.children
  }
}
