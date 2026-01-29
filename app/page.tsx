'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from './actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const QUICK_PERSONAS = [
  { email: 'customer1@demo.com', label: 'Customer', color: 'text-gray-900 group-hover:text-blue-600' },
  { email: 'agent1@demo.com', label: 'Support Agent', color: 'text-blue-700' },
  { email: 'supervisor@demo.com', label: 'Supervisor', color: 'text-purple-700' },
  { email: 'manager@demo.com', label: 'Case Manager', color: 'text-orange-700' },
  { email: 'qa@demo.com', label: 'QA Team', color: 'text-green-700' },
  { email: 'analytics@demo.com', label: 'Analytics', color: 'text-pink-700' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = await loginUser(email)
    if (!user) {
      setError('User not found. Check the seed data or try "customer1@demo.com"')
      return
    }
    localStorage.setItem('hosho-user-id', user.id)
    localStorage.setItem('hosho-user-role', user.role)
    switch (user.role) {
      case 'CUSTOMER':
        router.push('/customer/dashboard')
        break
      case 'AGENT':
        router.push('/agent/dashboard')
        break
      case 'SUPERVISOR':
        router.push('/supervisor/dashboard')
        break
      case 'MANAGER':
        router.push('/manager/dashboard')
        break
      case 'QA':
        router.push('/qa/dashboard')
        break
      case 'ANALYTICS':
        router.push('/analytics/dashboard')
        break
      default:
        setError('Unknown role')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-blue-900">Ticket System</CardTitle>
          <CardDescription>Select a persona to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                placeholder="user@demo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Login</Button>
            
            <div className="mt-6 text-xs text-gray-500 space-y-3 border-t pt-4">
              <p className="font-semibold uppercase tracking-wide text-gray-400">Quick Login Personas</p>
              
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PERSONAS.map((persona) => (
                  <div 
                    key={persona.email}
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => setEmail(persona.email)}
                  >
                    <p className={`font-medium ${persona.color}`}>{persona.label}</p>
                    <p className="text-[10px]">{persona.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}