import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="The page you are looking for does not exist or may have been moved."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/players">Browse players</Link>
          </Button>
        </div>
      }
    />
  )
}
