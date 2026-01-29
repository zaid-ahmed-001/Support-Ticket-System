/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createComment, getTicketDetails, addAttachment, submitFeedback } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from '@/components/DashboardLayout'
import { usePolling } from '@/hooks/usePolling'

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState('')
  const router = useRouter()

  const [rating, setRating] = useState('5')
  const [feedbackComment, setFeedbackComment] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('hosho-user-role') || ''
    const uid = localStorage.getItem('hosho-user-id') || ''
    
    if (!uid) {
      router.push('/')
      return
    }

    setUserRole(role)
    setUserId(uid)

    getTicketDetails(id).then(data => {
      setTicket(data)
      setLoading(false)
    })
  }, [id, router])

  async function handlePostComment() {
    if (!comment.trim()) return
    await createComment(id, userId, comment, isInternal)
    setComment('')
    setIsInternal(false)
    refreshData()
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    await addAttachment(id, file.name)
    setIsUploading(false)
    refreshData()
  }

  async function handleFeedbackSubmit() {
    await submitFeedback(id, parseInt(rating), feedbackComment)
    refreshData()
  }

  async function refreshData() {
    const updated = await getTicketDetails(id)
    setTicket(updated)
  }

  usePolling(5000, refreshData);

  if (loading) return <div className="p-10">Loading ticket details...</div>
  if (!ticket) return <div className="p-10">Ticket not found</div>

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {ticket.subject}
              <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                {ticket.status}
              </Badge>
            </h1>
            
            <p className="text-gray-500 mt-1">Ticket ID: {ticket.id}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Ticket Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
              <div>
                  <span className="font-semibold block">Description:</span>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap break-all">
                    {ticket.description}
                  </p>
                </div>
                <div className="border-t pt-3"><span className="font-semibold">Category:</span> {ticket.category}</div>
                <div><span className="font-semibold">Priority:</span> {ticket.priority}</div>
                <div><span className="font-semibold">Customer:</span> {ticket.customer.name}</div>
                <div><span className="font-semibold">Assignee:</span> {ticket.assignedTo?.name || 'Unassigned'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Attachments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {ticket.attachments?.length > 0 ? (
                  <ul className="space-y-2">
                    {ticket.attachments.map((file: any) => (
                      <li key={file.id} className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        {file.fileName}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-gray-400 italic">No files attached.</p>}

                <div className="border-t pt-4">
                  <Label htmlFor="file" className="text-xs mb-2 block">Add File</Label>
                  <div className="flex gap-2">
                    <Input id="file" type="file" onChange={handleFileUpload} disabled={isUploading} className="text-xs" />
                    {isUploading && <span className="text-xs text-blue-500 self-center">...</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && userRole === 'CUSTOMER' && !ticket.feedback && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader><CardTitle className="text-green-800">Rate Service</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Select value={rating} onValueChange={setRating}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ (Excellent)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ (Good)</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ (Average)</SelectItem>
                        <SelectItem value="2">⭐⭐ (Poor)</SelectItem>
                        <SelectItem value="1">⭐ (Terrible)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Comment</Label>
                    <Textarea 
                      placeholder="How was your experience?" 
                      value={feedbackComment} 
                      onChange={e => setFeedbackComment(e.target.value)} 
                    />
                  </div>
                  <Button onClick={handleFeedbackSubmit} className="w-full bg-green-600 hover:bg-green-700">Submit Feedback</Button>
                </CardContent>
              </Card>
            )}

            {ticket.feedback && (
              <Card className="bg-gray-50">
                <CardHeader><CardTitle className="text-sm">Customer Feedback</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-yellow-500 text-lg">{'★'.repeat(ticket.feedback.rating)}</div>
                  <p className="text-sm italic">"{ticket.feedback.comment}"</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Card className="h-full flex flex-col min-h-[500px]">
              <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                
                <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto p-4 border rounded-md bg-gray-50">
                  {ticket.comments.map((msg: any) => {
                    if (msg.isInternal && userRole === 'CUSTOMER') return null
                    const isMe = msg.userId === userId
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${msg.isInternal ? 'bg-yellow-100 text-yellow-900 border-yellow-300 border' : isMe ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                          {msg.isInternal && <div className="text-[10px] font-bold uppercase mb-1">🔒 Internal Note</div>}
                          <p>{msg.content}</p>
                          <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>{msg.user.name} • {new Date(msg.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 space-y-3">
                  <Textarea placeholder="Type reply..." value={comment} onChange={(e) => setComment(e.target.value)} />
                  <div className="flex justify-between items-center">
                    {userRole !== 'CUSTOMER' ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox id="internal" checked={isInternal} onCheckedChange={(checked) => setIsInternal(checked as boolean)} />
                        <Label htmlFor="internal" className="text-sm font-medium text-yellow-700 cursor-pointer">🔒 Internal Note</Label>
                      </div>
                    ) : <div />}
                    <Button onClick={handlePostComment}>{isInternal ? 'Post Note' : 'Send Reply'}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}