'use client'

import { useRouter } from 'next/navigation'
import { createTicket } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateTicketPage() {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const customerId = localStorage.getItem('hosho-user-id')
    
    if (!customerId) {
      alert("You must be logged in to submit a ticket.")
      return
    }

    formData.append('customerId', customerId)
    
    await createTicket(formData)
    router.push('/customer/dashboard')
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>Describe your issue and we&apos;ll get back to you shortly.</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input name="subject" id="subject" placeholder="e.g., Cannot login to account" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical Issue</SelectItem>
                  <SelectItem value="Billing">Billing & Account</SelectItem>
                  <SelectItem value="Feature">Feature Request</SelectItem>
                  <SelectItem value="General">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                name="description" 
                id="description" 
                placeholder="Please provide details..." 
                className="min-h-[150px]"
                required 
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Submit Ticket</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}