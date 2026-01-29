'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- 1. AUTHENTICATION ---
export async function loginUser(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function getAllAgents() {
  return await prisma.user.findMany({
    where: { role: 'AGENT' },
    select: { id: true, name: true, email: true }
  })
}

// --- 2. TICKET MANAGEMENT (Customer/Agent) ---
export async function createTicket(formData: FormData) {
  const subject = formData.get('subject') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const customerId = formData.get('customerId') as string

  await prisma.ticket.create({
    data: {
      subject,
      description,
      category,
      customerId,
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  })
  revalidatePath('/customer/dashboard')
}

export async function getTicketsByUser(userId: string, role: string) {
  if (role === 'CUSTOMER') {
    return await prisma.ticket.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
    })
  } else {
    // Agents, Supervisors, Managers see ALL tickets
    return await prisma.ticket.findMany({
      include: { customer: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export async function getTicketDetails(ticketId: string) {
  return await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      customer: true,
      assignedTo: true,
      feedback: true,
      attachments: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

export async function updateTicketStatus(ticketId: string, newStatus: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: newStatus },
  })
  revalidatePath('/agent/dashboard')
}

export async function createComment(ticketId: string, userId: string, content: string, isInternal: boolean) {
  await prisma.comment.create({
    data: { content, isInternal, ticketId, userId }
  })
  revalidatePath(`/ticket/${ticketId}`)
}

// --- 3. CUSTOMER FEATURES (Attachments & Feedback) ---
export async function addAttachment(ticketId: string, fileName: string) {
  await prisma.attachment.create({
    data: {
      fileName: fileName,
      filePath: `/uploads/${fileName}`, // Mock path
      ticketId: ticketId
    }
  })
  revalidatePath(`/ticket/${ticketId}`)
}

export async function submitFeedback(ticketId: string, rating: number, comment: string) {
  // Prevent duplicate ratings
  const existing = await prisma.feedback.findUnique({ where: { ticketId } })
  if (existing) throw new Error("Feedback already submitted")

  await prisma.feedback.create({
    data: { rating, comment, ticketId }
  })
  
  // Auto-close ticket
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CLOSED', resolvedAt: new Date() }
  })
  revalidatePath(`/ticket/${ticketId}`)
}

// --- 4. SUPERVISOR FEATURES (Assignment & Metrics) ---
export async function assignTicket(ticketId: string, agentId: string, actorId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw new Error("Ticket not found")

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: agentId }
  })

  // Audit Log
  await prisma.auditLog.create({
    data: {
      action: "ASSIGNMENT",
      details: `Assigned to agent ${agentId}`,
      ticketId: ticketId,
      actorId: actorId
    }
  })
  revalidatePath('/supervisor/dashboard')
}

export async function getSupervisorMetrics() {
  const totalTickets = await prisma.ticket.count()
  const openTickets = await prisma.ticket.count({ where: { status: 'OPEN' } })
  const unassignedTickets = await prisma.ticket.count({ where: { assignedToId: null } })
  const urgentTickets = await prisma.ticket.count({ where: { priority: 'URGENT' } })

  return { totalTickets, openTickets, unassignedTickets, urgentTickets }
}

// --- 5. CASE MANAGEMENT (Managers) ---
export async function createCase(title: string, description: string, managerId: string) {
  await prisma.case.create({
    data: { title, description, managerId }
  })
  revalidatePath('/manager/dashboard')
}

export async function getCases() {
  return await prisma.case.findMany({
    include: { _count: { select: { tickets: true } } }
  })
}

export async function getCaseDetails(caseId: string) {
  return await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      tickets: { include: { ticket: true } },
      milestones: { orderBy: { dueDate: 'asc' } }
    }
  })
}

export async function getAvailableTickets() {
  return await prisma.ticket.findMany({
    where: { status: { not: 'CLOSED' } },
    select: { id: true, subject: true, status: true }
  })
}

export async function linkTicketToCase(caseId: string, ticketId: string) {
  const existing = await prisma.caseTicket.findUnique({
    where: { caseId_ticketId: { caseId, ticketId } }
  })
  
  if (!existing) {
    await prisma.caseTicket.create({
      data: { caseId, ticketId }
    })
  }
  revalidatePath(`/manager/case/${caseId}`)
}

export async function addMilestone(caseId: string, title: string, dueDate: Date) {
  await prisma.milestone.create({
    data: { caseId, title, dueDate }
  })
  revalidatePath(`/manager/case/${caseId}`)
}

// --- 6. QA & ANALYTICS (Exports & Audits) ---
export async function getAuditLogs() {
  return await prisma.auditLog.findMany({
    include: { 
      ticket: { select: { subject: true } }, 
      actor: { select: { name: true, role: true } } 
    },
    orderBy: { timestamp: 'desc' },
    take: 50
  })
}

export async function getClosedTicketsWithFeedback() {
  return await prisma.ticket.findMany({
    where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    include: { 
      feedback: true, 
      customer: { select: { name: true } },
      assignedTo: { select: { name: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })
}

export async function getRawDataForExport() {
  const data = await prisma.ticket.findMany({
    include: {
      customer: { select: { name: true, email: true } },
      assignedTo: { select: { name: true } },
      feedback: { select: { rating: true } }
    }
  })

  return data.map(t => ({
    TicketID: t.id,
    Subject: t.subject,
    Status: t.status,
    Priority: t.priority,
    Category: t.category,
    CreatedDate: t.createdAt.toISOString(),
    ResolvedDate: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    Customer: t.customer.name,
    Agent: t.assignedTo?.name || 'Unassigned',
    CSAT: t.feedback?.rating || 0
  }))
}

export async function escalateCase(caseId: string) {
  // 1. Update Case Status
  await prisma.case.update({
    where: { id: caseId },
    data: { description: `[ESCALATED] ` } // Appending tag for visibility
  })

  // 2. Find all linked tickets and mark URGENT
  const linked = await prisma.caseTicket.findMany({ where: { caseId } })
  for (const link of linked) {
    await prisma.ticket.update({
      where: { id: link.ticketId },
      data: { priority: 'URGENT' }
    })
  }
  revalidatePath(`/manager/case/${caseId}`)
}

export async function createRoutingRule(category: string, assignToEmail: string) {
  await prisma.routingRule.create({
    data: { category, assignToEmail }
  })
  revalidatePath('/supervisor/rules')
}

export async function getRoutingRules() {
  return await prisma.routingRule.findMany()
}