/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { getCases, createCase } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DashboardLayout from '@/components/DashboardLayout'

export default function CaseManagerDashboard() {
  const [cases, setCases] = useState<any[]>([])
  
  useEffect(() => {
    getCases().then(setCases)
  }, [])

  async function handleCreate(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const managerId = localStorage.getItem('hosho-user-id') || ''
    await createCase(title, description, managerId)
    const updated = await getCases()
    setCases(updated)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Case Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Create New Case</CardTitle></CardHeader>
            <CardContent>
              <form action={handleCreate} className="space-y-4">
                <div>
                  <Label>Case Title</Label>
                  <Input name="title" required placeholder="e.g., Q3 System Outage" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input name="description" required />
                </div>
                <Button type="submit">Initialize Case</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Cases</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.map(c => (
                  <div key={c.id} className="p-4 border rounded flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{c.title}</h3>
                      <p className="text-sm text-gray-500">{c._count.tickets} Linked Tickets</p>
                    </div>
                      <Button variant="outline" onClick={() => window.location.href = `/manager/case/${c.id}`}>
                      Manage Workflow
                      </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}