'use client'

import { useEffect, useState } from 'react'
import { getTicketsByUser, getAllAgents, assignTicket, getSupervisorMetrics } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from '@/components/DashboardLayout'

export default function SupervisorDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  
  useEffect(() => {
    getTicketsByUser('supervisor', 'SUPERVISOR').then(setTickets)
    getAllAgents().then(setAgents)
    getSupervisorMetrics().then(setMetrics)
  }, [])

    const handleAssign = async (ticketId: string, agentId: string) => {
    const supervisorId = localStorage.getItem('hosho-user-id')

    if (!supervisorId) {
      alert("Error: You do not appear to be logged in.")
      return
    }

    await assignTicket(ticketId, agentId, supervisorId)
    
    setTickets(tickets.map(t => 
      t.id === ticketId 
      ? { ...t, assignedTo: agents.find(a => a.id === agentId) } 
      : t
    ))
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Supervisor Command Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Tickets</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics?.totalTickets || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-500">Unassigned</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-500">{metrics?.unassignedTickets || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Open Cases</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics?.openTickets || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-orange-500">Urgent</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-500">{metrics?.urgentTickets || 0}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Assignee</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell><Badge variant="outline">{ticket.status}</Badge></TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                          <span className="text-green-600 font-medium">{ticket.assignedTo.name}</span>
                      ) : (
                          <span className="text-red-500 font-bold">UNASSIGNED</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(agentId) => handleAssign(ticket.id, agentId)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign Agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}