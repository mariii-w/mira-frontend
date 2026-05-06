import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { AccessibilityProvider } from './providers/AccessibilityProvider'
import './globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <RouterProvider router={router} />
    </AccessibilityProvider>
  </StrictMode>,
)