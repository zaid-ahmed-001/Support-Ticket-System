'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTicketsByUser, updateTicketStatus } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from '@/components/DashboardLayout'

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('hosho-user-role')
    const userId = localStorage.getItem('hosho-user-id')

    if (!userId || role !== 'AGENT') {
      if (role !== 'MANAGER') {
        router.push('/')
        return
      }
    }

    getTicketsByUser(userId || '', role || '').then((data) => {
      setTickets(data)
      setLoading(false)
    })
  }, [router])

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    
    await updateTicketStatus(ticketId, newStatus)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 hover:bg-red-600';
      case 'HIGH': return 'bg-orange-500 hover:bg-orange-600';
      case 'MEDIUM': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  }

  if (loading) return <div className="p-10">Loading agent workspace...</div>

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Workspace</h1>
            <p className="text-gray-500">Manage and resolve incoming support requests.</p>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>Log Out</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticket.subject}
                      <div className="text-xs text-gray-500">{ticket.category}</div>
                    </TableCell>
                    <TableCell>{ticket.customer?.name || ticket.customer?.email || 'Unknown'}</TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={ticket.status} 
                        onValueChange={(val) => handleStatusChange(ticket.id, val)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/ticket/${ticket.id}`)}
                      >
                        Open Case
                      </Button>
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