/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getTicketsByUser } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DashboardLayout from '@/components/DashboardLayout'

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('hosho-user-id')
    const role = localStorage.getItem('hosho-user-role')
    
    if (!userId || role !== 'CUSTOMER') {
      router.push('/')
      return
    }

    getTicketsByUser(userId, role).then((data) => {
      setTickets(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-10">Loading your tickets...</div>

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Support Tickets</h1>
          <Link href="/customer/create">
            <Button>+ Create New Ticket</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket History</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>You haven`t submitted any tickets yet.</p>
                <p className="text-sm mt-2">Click the button above to report an issue.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/ticket/${ticket.id}`}>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => router.push('/')}>Log Out</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}