interface LoginCallbackProps {
  error?: string
  retryHref: string
}

export function LoginCallback({ error, retryHref }: LoginCallbackProps) {
  if (error !== 'oauth2_failed') return null

  return (
    <div className="min-h-svh bg-background flex items-center justify-center px-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border/30 p-10 flex flex-col items-center gap-6 max-w-sm w-full text-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-h2 text-foreground">Login failed</h2>
          <p className="text-small text-muted">
            Something went wrong signing you in with Google. Please try again.
          </p>
        </div>

        <a
          href={retryHref}
          className="w-full inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-small px-6 py-3 transition-colors no-underline"
        >
          Try again with Google
        </a>
      </div>
    </div>
  )
}
