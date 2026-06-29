import { useEffect } from 'react'
import { HeadContent, Scripts, createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import * as Sentry from '@sentry/react'
import appCss from '../styles.css?url'
import { supabase } from '../utils/supabase'
import { authSyncSession, authClearSession } from '../server/auth.functions'

if (typeof window !== 'undefined' && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    title: 'MR. CINEMATIC SHOOT — Cinematic Photography & Reels',
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content: 'MR. CINEMATIC SHOOT is a premium influencer & commercial photography studio. We don\'t take photos — we create cinematic stories and reels for brands.',
      },
      {
        property: 'og:title',
        content: 'MR. CINEMATIC SHOOT — Cinematic Photography & Reels',
      },
      {
        property: 'og:description',
        content: 'MR. CINEMATIC SHOOT is a premium influencer & commercial photography studio. We don\'t take photos — we create cinematic stories and reels.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'theme-color',
        content: '#000000',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  }),
  component: RootDocument,
})

function RootDocument() {
  const { queryClient } = Route.useRouteContext()
  useEffect(() => {
    // Sync client-side session to server-side cookies
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await authSyncSession({
          data: {
            sessionToken: session.access_token,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            userId: session.user.id
          }
        })
      } else {
        await authClearSession()
      }
      // Invalidate queries to reload session state across components
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="font-sans antialiased text-foreground bg-background selection:bg-neon selection:text-black cinematic-grain">
          <Outlet />
          <Toaster theme="dark" position="bottom-center" toastOptions={{
            style: {
              background: 'rgba(17, 17, 17, 0.9)',
              border: '1px solid rgba(255, 122, 0, 0.3)',
              color: '#ffffff',
              fontFamily: '"Rajdhani", sans-serif',
              backdropFilter: 'blur(16px)'
            }
          }} />
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  )
}
