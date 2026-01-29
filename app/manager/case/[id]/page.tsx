/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { getCaseDetails, getAvailableTickets, linkTicketToCase, addMilestone, escalateCase } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from '@/components/DashboardLayout'

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [caseData, setCaseData] = useState<any>(null)
  const [allTickets, setAllTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState('')
  
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [milestoneDate, setMilestoneDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const cData = await getCaseDetails(id)
    const tData = await getAvailableTickets()
    setCaseData(cData)
    setAllTickets(tData)
  }

  async function handleLinkTicket() {
    if (!selectedTicket) return
    await linkTicketToCase(id, selectedTicket)
    await loadData()
    setSelectedTicket('')
  }

  async function handleAddMilestone() {
    if (!milestoneTitle || !milestoneDate) return
    await addMilestone(id, milestoneTitle, new Date(milestoneDate))
    await loadData()
    setMilestoneTitle('')
    setMilestoneDate('')
  }

  async function handleEscalation() {
    if(confirm("Are you sure? This will mark all linked tickets as URGENT.")) {
      await escalateCase(id)
      loadData()
    }
  }

  if (!caseData) return <div className="p-10">Loading case workflow...</div>

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{caseData.title}</h1>
          <p className="text-gray-500">{caseData.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleEscalation}>Escalate Case</Button>
          <Button variant="outline" onClick={() => router.push('/manager/dashboard')}>Back</Button>
        </div>      
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Linked Tickets</CardTitle></CardHeader>
            <CardContent>
              
              <div className="flex gap-2 mb-4">
                <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a ticket to link..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allTickets.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        [{t.status}] {t.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLinkTicket}>Link</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow><TableHead>Ticket</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {caseData.tickets.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-gray-400">No tickets linked yet.</TableCell></TableRow>}
                  
                  {caseData.tickets.map((rel: any) => (
                    <TableRow key={rel.ticket.id}>
                      <TableCell className="font-medium">{rel.ticket.subject}</TableCell>
                      <TableCell><Badge variant="outline">{rel.ticket.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/ticket/${rel.ticket.id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Timeline & Milestones</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded border mb-6 space-y-3">
                <h4 className="font-semibold text-sm">Add New Milestone</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Milestone Title" 
                    value={milestoneTitle}
                    onChange={e => setMilestoneTitle(e.target.value)}
                  />
                  <Input 
                    type="date" 
                    value={milestoneDate}
                    onChange={e => setMilestoneDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddMilestone} size="sm" className="w-full">Add to Timeline</Button>
              </div>

              <div className="space-y-4 border-l-2 border-gray-200 ml-2 pl-4">
                {caseData.milestones.length === 0 && <p className="text-sm text-gray-400">No milestones set.</p>}
                
                {caseData.milestones.map((m: any) => (
                  <div key={m.id} className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                    <p className="text-sm text-gray-500">{new Date(m.dueDate).toLocaleDateString()}</p>
                    <h4 className="font-bold text-gray-900">{m.title}</h4>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}