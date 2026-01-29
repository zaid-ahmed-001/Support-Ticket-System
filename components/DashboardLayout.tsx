'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  BarChart3, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // 1. SECURITY CHECK: Is user logged in?
    const storedRole = localStorage.getItem('hosho-user-role')
    const storedId = localStorage.getItem('hosho-user-id')

    if (!storedId || !storedRole) {
      router.push('/') // Kick them back to login
      return
    }

    // 2. ROLE CHECK: Are they allowed here?
    // Prevent Customers from entering Agent/Manager areas
    if (pathname.startsWith('/agent') && storedRole !== 'AGENT' && storedRole !== 'SUPERVISOR') router.push('/')
    if (pathname.startsWith('/supervisor') && storedRole !== 'SUPERVISOR') router.push('/')
    if (pathname.startsWith('/manager') && storedRole !== 'MANAGER') router.push('/')
    
    setRole(storedRole)
  }, [pathname, router])

  if (!role) return null // Prevent flashing protected content

  // 3. NAVIGATION: Generate links based on Role
  const getNavLinks = () => {
    switch (role) {
      case 'CUSTOMER': return [
        { href: '/customer/dashboard', label: 'My Tickets', icon: Ticket },
        { href: '/customer/create', label: 'New Ticket', icon: LayoutDashboard },
      ]
      case 'AGENT': return [
        { href: '/agent/dashboard', label: 'Workspace', icon: LayoutDashboard },
      ]
      case 'SUPERVISOR': return [
        { href: '/supervisor/dashboard', label: 'Team Overview', icon: Users },
        { href: '/supervisor/rules', label: 'Routing Rules', icon: Settings },
      ]
      case 'MANAGER': return [
        { href: '/manager/dashboard', label: 'Case Board', icon: Briefcase },
      ]
      case 'QA': return [
        { href: '/qa/dashboard', label: 'Audit Hub', icon: ShieldCheck },
      ]
      case 'ANALYTICS': return [
        { href: '/analytics/dashboard', label: 'Reports', icon: BarChart3 },
      ]
      default: return []
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Ticket System
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{role} Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {getNavLinks().map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => { localStorage.clear(); router.push('/') }}>
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <h1 className="font-semibold text-gray-800">Dashboard</h1>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {role[0]}
          </div>
        </header>
        <div className="p-6">
          {children} {/* <--- This is where your page content goes */}
        </div>
      </main>
    </div>
  )
}