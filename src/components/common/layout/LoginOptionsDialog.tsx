import * as Dialog from '@radix-ui/react-dialog'
import { useState, type ReactNode } from 'react'
import { KeyRound, X } from 'lucide-react'
import { getStartGoogleLoginUrl, getPrivateUserProfile } from '../../../api/mira'
import { decodeJwtPayload, useAuthStore } from '../../../stores/auth'
import { startPasskeyLogin } from '../../../lib/passkeyAuth'
import { Button } from '../ui/Button'

interface JwtClaims {
  sub: string
  user_id: string
  scp?: string[]
}

interface LoginOptionsDialogProps {
  children: ReactNode
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.31v3.09C3.28 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.33c-.24-.72-.38-1.49-.38-2.33s.14-1.61.38-2.33V6.58H1.31A11.95 11.95 0 0 0 0 12c0 1.93.46 3.76 1.31 5.42l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.6 1.78l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.28 2.7 1.31 6.58l4 3.09c.94-2.83 3.58-4.92 6.69-4.92z"
      />
    </svg>
  )
}

export function LoginOptionsDialog({ children }: LoginOptionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)

  async function handlePasskeyLogin() {
    setPasskeyLoading(true)
    setPasskeyError(null)

    try {
      const { accessToken } = await startPasskeyLogin()
      const claims = decodeJwtPayload<JwtClaims>(accessToken)
      if (!claims?.sub || !claims.user_id) {
        useAuthStore.getState().clear()
        setPasskeyError('Passkey login failed. Please try again.')
        return
      }

      useAuthStore.getState().setToken({
        accessToken,
        accountId: claims.sub,
        permissions: claims.scp ?? [],
      })

      const userResponse = await getPrivateUserProfile(claims.user_id)
      if (userResponse.status !== 200) {
        useAuthStore.getState().clear()
        setPasskeyError('Passkey login failed. Please try again.')
        return
      }

      useAuthStore.getState().setUser(userResponse.data)
      setOpen(false)
    } catch {
      useAuthStore.getState().clear()
      setPasskeyError('Passkey login failed. Please try again.')
    } finally {
      setPasskeyLoading(false)
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setPasskeyError(null)
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-xl">
          <div className="relative">
            <Dialog.Close asChild>
              <Button
                variant="icon"
                size="sm"
                aria-label="Close"
                className="absolute right-0 top-0"
              >
                <X size={14} />
              </Button>
            </Dialog.Close>

            <div className="flex flex-col items-center gap-1 px-6 text-center">
              <Dialog.Title className="font-heading text-h2 text-foreground">
                Log in
              </Dialog.Title>
              <Dialog.Description className="text-small text-muted">
                Choose how you'd like to sign in to Mira
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={getStartGoogleLoginUrl()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-charcoal bg-transparent px-5 text-body font-medium text-foreground no-underline transition-colors duration-150 hover:bg-charcoal/5"
            >
              <GoogleIcon />
              Continue with Google
            </a>

            <Button
              variant="primary"
              fullWidth
              leadingIcon={<KeyRound />}
              loading={passkeyLoading}
              onClick={() => void handlePasskeyLogin()}
            >
              Continue with Passkey
            </Button>

            {passkeyError && (
              <p className="text-small font-medium text-red-600" role="alert">
                {passkeyError}
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
