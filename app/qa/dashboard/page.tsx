/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getAuditLogs, getClosedTicketsWithFeedback } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from '@/components/DashboardLayout'

export default function QADashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    getAuditLogs().then(setLogs)
    getClosedTicketsWithFeedback().then(setReviews)
  }, [])

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Quality Assurance Hub</h1>

        <Tabs defaultValue="audits">
          <TabsList>
            <TabsTrigger value="audits">Compliance Audits</TabsTrigger>
            <TabsTrigger value="reviews">Resolution Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="audits">
            <Card>
              <CardHeader><CardTitle>System Activity Log</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-muted-foreground"></div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Ticket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-gray-500 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.actor?.name}</div>
                          <div className="text-xs text-gray-500">{log.actor?.role}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell className="text-xs">{log.ticket?.subject}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader><CardTitle>Closed Ticket Reviews</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>CSAT Rating</TableHead>
                      <TableHead>Customer Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.subject}</TableCell>
                        <TableCell>{t.assignedTo?.name}</TableCell>
                        <TableCell>
                          {t.feedback ? (
                            <div className="flex gap-1 text-yellow-500">
                              {'★'.repeat(t.feedback.rating)}
                              <span className="text-gray-300">{'★'.repeat(5 - t.feedback.rating)}</span>
                            </div>
                          ) : <span className="text-gray-400">Not Rated</span>}
                        </TableCell>
                        <TableCell className="italic text-gray-600">
                          {t.feedback?.comment || "No comment provided"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}