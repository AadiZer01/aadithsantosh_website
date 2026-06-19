'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, LogOut, LogIn } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .single()
          .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push('/')
    router.refresh()
  }

    const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/research', label: 'Research' },
    { href: '/insights', label: 'Insights' },
    ...(isAdmin ? [{ href: '/admin/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <nav className="bg-paper border-b border-line sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline text-inherit">
              <span className="grid w-8 h-8 shrink-0 place-items-center rounded-full bg-ink text-paper font-extrabold text-xs tracking-tight">
                AS
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-[1.05rem] text-ink tracking-tight leading-none">Aadith Santosh</span>
                <span className="text-2xs font-bold uppercase tracking-[0.1em] text-muted mt-0.5">Equity Research</span>
              </div>
            </Link>
          </div>

                    <div className="hidden sm:flex sm:items-center sm:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-ui transition-colors border-b border-transparent ${
                  pathname === link.href
                    ? 'text-ink border-ink'
                    : 'text-muted hover:text-ink hover:border-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-ui text-muted hover:text-ink transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-ui text-muted hover:text-ink transition-colors"
              >
                Login
              </Link>
            )}
            <Link
              href="mailto:aadithsantosh@outlook.com"
              className="inline-flex items-center justify-center min-h-[36px] px-4 border border-ink text-ink rounded-lg font-bold text-sm hover:-translate-y-0.5 transition-all"
            >
              Contact
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center justify-center min-h-[36px] px-4 bg-ink text-paper rounded-lg font-bold text-sm hover:-translate-y-0.5 transition-all"
            >
              View Reports
            </Link>
          </div>

          <div className="sm:hidden flex items-center gap-2">
            {user ? (
              <button onClick={handleLogout} className="text-muted hover:text-ink text-sm">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-muted hover:text-ink text-sm">
                Login
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted hover:text-ink"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden border-t border-line">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-paper text-ink'
                    : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-line my-2" />
            <Link
              href="mailto:aadithsantosh@outlook.com"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-muted hover:bg-paper hover:text-ink"
            >
              Contact
            </Link>
            <Link
              href="/research"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-ink font-bold bg-paper"
            >
              View Reports
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-muted hover:bg-paper hover:text-ink"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-muted hover:bg-paper hover:text-ink"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
