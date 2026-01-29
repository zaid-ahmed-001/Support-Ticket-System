'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { createRoutingRule, getRoutingRules, getAllAgents } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RoutingRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [category, setCategory] = useState('')
  const [agentEmail, setAgentEmail] = useState('')

  useEffect(() => {
    getRoutingRules().then(setRules)
    getAllAgents().then(setAgents)
  }, [])

  const handleAddRule = async () => {
    await createRoutingRule(category, agentEmail)
    const updated = await getRoutingRules()
    setRules(updated)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Automation Rules</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>Create New Routing Rule</CardTitle></CardHeader>
            <CardContent className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">If Category is:</label>
                <Select onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Feature">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Assign to Agent:</label>
                <Select onValueChange={setAgentEmail}>
                  <SelectTrigger><SelectValue placeholder="Select Agent" /></SelectTrigger>
                  <SelectContent>
                    {agents.map(a => <SelectItem key={a.id} value={a.email}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRule}>Add Rule</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Rules</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Condition</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rules.length === 0 && <TableRow><TableCell colSpan={2}>No rules defined.</TableCell></TableRow>}
                  {rules.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>If Category == <span className="font-bold">{r.category}</span></TableCell>
                      <TableCell>Assign to <span className="text-blue-600">{r.assignToEmail}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}