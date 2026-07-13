import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { notify } from '@/lib/notify'

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark'
        toggleTheme()
        notify.info(next === 'dark' ? 'Dark mode on' : 'Light mode on')
      }}
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      aria-pressed={theme === 'dark'}
      className="relative shrink-0"
    >
      <Sun
        className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <Moon
        className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
    </Button>
  )
}
