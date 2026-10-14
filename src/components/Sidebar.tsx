'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useAuth } from '@/components/AuthProvider'
import { ROUTES } from '@/constants/routes'
import { RawLogsCreate } from '@/modules/raw-logs/components/create'
import { ProfilesApi } from '@/api/profiles'
import type { IProfileModel } from '@/interfaces/profile.model'
import { Button } from '@/atoms/button'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import LogoutIcon from '@mui/icons-material/Logout'
import ListItemButton from '@mui/material/ListItemButton'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'

const links = [
  { href: ROUTES.GOALS.LIST, label: 'Goals', icon: TrackChangesIcon },
  { href: ROUTES.SKILLS.LIST, label: 'Skills', icon: StarBorderIcon },
]

/**
 * Collapsible left sidebar per the design doc — logo links to the
 * post-login landing page (Goals list), a standalone Quick log button
 * above the nav (opens the same RawLogsCreate modal Goal detail uses,
 * just without a pre-filled goal), exactly Goals/Skills, and at the
 * bottom the avatar + user's name (links to the Profile page), a
 * divider, and Sign out.
 * Collapsed state shows icon-only (first letter) with a native `title`
 * tooltip instead of pulling in an icon/tooltip library.
 *
 * Self-hides when signed out, so it's safe to render unconditionally in
 * layout.tsx above both authenticated pages and /login, /forgot-password.
 */
export function Sidebar() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const [profile, setProfile] = useState<IProfileModel | null>(null)
  // Id của user mà lần gọi profile bị lỗi — khi đó thôi skeleton, hiện email thay tên
  const [profileFailedFor, setProfileFailedFor] = useState<string | null>(null)
  const userId = user?.id

  // Auth only knows the email — the name shown next to the avatar comes
  // from the profile. Failing to load it just falls back to the email.
  useEffect(() => {
    if (!userId) return
    ProfilesApi.me()
      .then(({ data }) => setProfile(data))
      .catch(() => setProfileFailedFor(userId))
  }, [userId])

  // if (pathname === ROUTES.ONBOARDING) return null // Xử lý drop onboarding cho làm lại onboarding
  const hiddenRoutes: string[] = [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.ONBOARDING]
  if (hiddenRoutes.includes(pathname)) return null // Xử lý danh sách các đường dẫn ko được hiện sidebar
  // Khung sidebar render ngay cả khi đang chờ getUser() lúc refresh, chỉ ẩn khi chắc chắn chưa đăng nhập
  if (!loading && !user) return null

  // Ignore a profile left over from a previously signed-in user.
  const ownProfile = user && profile?.id === user.id ? profile : null
  // Chỉ phần avatar + tên chờ data: chưa có user, hoặc profile chưa về (và chưa lỗi)
  const profileLoading = !user || (!ownProfile && profileFailedFor !== user.id)
  const fullName = [ownProfile?.firstName, ownProfile?.lastName].filter(Boolean).join(' ')
  const displayName = fullName || user?.email || '?'
  // Same rule as the Profile page: both initials once the name is set,
  // otherwise the first letter of the email.
  const initials = (
    ownProfile?.firstName && ownProfile?.lastName
      ? ownProfile.firstName[0]! + ownProfile.lastName[0]!
      : displayName[0]!
  ).toUpperCase()

  return (
    <>
      <aside
        className={clsx(
          'sticky top-0 flex h-screen shrink-0 flex-col justify-between border-r border-slate-200 py-4 transition-[width]',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <div>
          {/* Fixed height: the logo is taller than the icon, so without it the
              row shrinks when collapsed and everything below jumps up. */}
          <div className={clsx('flex h-7 items-center gap-2 px-4', collapsed && 'justify-center px-0')}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="flex items-center"
            >
              <MenuIcon
                fontSize="small"
                sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
              />
            </button>
            {!collapsed && (
              <Link href={ROUTES.POST_LOGIN_REDIRECT} className="text-lg font-semibold text-slate-900">
                Kowabowa
              </Link>
            )}
          </div>
          <div className="mt-6 px-2">
            <Button
              type="button"
              onClick={() => setQuickLogOpen(true)}
              title={collapsed ? 'Quick log' : undefined}
              fullWidth
              // MUI buttons are at least 64px wide — wider than the collapsed
              // sidebar's 48px content area — so drop the minimum.
              sx={{ minWidth: 0, px: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              <AddIcon fontSize="small" />
              {/* Always rendered and animated closed, in step with the aside's
                  width transition — swapping it in/out made the button jump. */}
              <span
                className={clsx(
                  'overflow-hidden transition-[max-width,margin,opacity]',
                  collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-2 max-w-32 opacity-100'
                )}
              >
                Quick log
              </span>
            </Button>

          </div>

          <nav className="mt-6 space-y-1 px-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href)
              return (
                <ListItemButton
                  key={link.href}
                  component={Link}
                  href={link.href}
                  selected={active}
                  title={collapsed ? link.label : undefined}

                  sx={{
                    borderRadius: 1,
                    px: 1,
                    py: 1,
                    gap: 1.5,
                    fontSize: 14,
                    lineHeight: '20px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}

                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-semibold">
                    <link.icon fontSize="small" />

                  </span>
                  {!collapsed && link.label}
                </ListItemButton>
              )
            })}
          </nav>

        </div>

        <div className="px-2">
          <ListItemButton
            component={Link}
            href={ROUTES.PROFILE}
            title={profileLoading ? undefined : collapsed ? displayName : (user?.email ?? undefined)}
            sx={{
              borderRadius: 1,
              px: 1,
              py: 1,
              gap: 1,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            {profileLoading ? (
              <>
                {/* Skeleton cùng kích thước avatar 32px + dòng tên text-sm */}
                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200" />
                {!collapsed && <div className="h-4 w-28 rounded bg-slate-200" />}
              </>
            ) : (
              <>
                <Avatar sx={{ width: 32, height: 32, fontSize: 14, fontWeight: 600, bgcolor: 'primary.main' }}>
                  {initials}
                </Avatar>
                {!collapsed && (
                  <span className="truncate text-sm font-medium text-slate-900">{displayName}</span>
                )}
              </>
            )}
          </ListItemButton>

          <Divider sx={{ my: 1.5 }} />

          <Button
            variant="ghost"
            fullWidth
            onClick={async () => {
              await signOut()
              router.push(ROUTES.LOGIN)
            }}
            title={collapsed ? 'Sign out' : undefined}
            endIcon={!collapsed && <LogoutIcon fontSize="small" />}
            sx={{
              minWidth: 0,
              height: 36,
              textTransform: 'none',
              justifyContent: collapsed ? 'center' : 'space-between',
              '& .MuiSvgIcon-root': { color: 'text.disabled' },
            }}
          >
            {collapsed ? <LogoutIcon fontSize="small" /> : 'Sign out'}
          </Button>
        </div>
      </aside>

      <RawLogsCreate
        open={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        onCreated={() => { }}
      />
    </>
  )
}
