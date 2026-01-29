import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helpers for randomness
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]
const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

async function main() {
  console.log("🌱 Starting Real-Life Seeding...")

  // 1. Clean old data
  try {
    await prisma.caseTicket.deleteMany()
    await prisma.milestone.deleteMany()
    await prisma.case.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.ticket.deleteMany()
    await prisma.user.deleteMany()
    await prisma.routingRule.deleteMany()
    console.log("🗑️  Cleaned up old data")
  } catch (e) {
    console.log("⚠️  Database clean skip (likely empty)")
  }

  // 2. Create Staff Users (Multiple Agents for Supervisor Balancing)
  const supervisor = await prisma.user.create({ data: { email: 'supervisor@demo.com', name: 'Sarah Supervisor', password: '123', role: 'SUPERVISOR' } })
  const manager = await prisma.user.create({ data: { email: 'manager@demo.com', name: 'Mike Manager', password: '123', role: 'MANAGER' } })
  const qa = await prisma.user.create({ data: { email: 'qa@demo.com', name: 'Quinn QA', password: '123', role: 'QA' } })
  const analytics = await prisma.user.create({ data: { email: 'analytics@demo.com', name: 'Andy Analyst', password: '123', role: 'ANALYTICS' } })

  const agents = []
  const agentNames = ['Bob Agent', 'Charlie Agent', 'Diana Agent']
  for (let i = 0; i < agentNames.length; i++) {
    const agent = await prisma.user.create({
      data: { email: `agent${i+1}@demo.com`, name: agentNames[i], password: '123', role: 'AGENT' }
    })
    agents.push(agent)
  }

  // 3. Create Multiple Customers
  const customers = []
  const customerNames = ['Alice Customer', 'Eve Customer', 'Frank Customer', 'Grace Customer', 'Heidi Customer']
  for (let i = 0; i < customerNames.length; i++) {
    const cust = await prisma.user.create({
      data: { email: `customer${i+1}@demo.com`, name: customerNames[i], password: '123', role: 'CUSTOMER' }
    })
    customers.push(cust)
  }

  console.log(`Created ${agents.length} Agents and ${customers.length} Customers`)

  // 4. Generate 50 Random Tickets (Spread over 30 days)
  const categories = ['Technical', 'Billing', 'Feature', 'Access']
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

  for (let i = 0; i < 50; i++) {
    const status = randomItem(statuses)
    const customer = randomItem(customers)
    const category = randomItem(categories)
    const createdDate = pastDate(randomInt(0, 30)) // Random date in last 30 days

    // Logic: If resolved/closed, it usually has an agent and maybe feedback
    let assignedAgent = null
    let resolvedDate = null

    if (status !== 'OPEN') {
      assignedAgent = randomItem(agents) // Assign to random agent
      if (status === 'RESOLVED' || status === 'CLOSED') {
        resolvedDate = new Date(createdDate.getTime() + randomInt(1, 48) * 60 * 60 * 1000) // Resolved 1-48 hours later
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject: `${category} Issue: ${randomInt(1000, 9999)}`,
        description: `This is a simulated ${category} issue reported by ${customer.name}.`,
        category: category,
        priority: randomItem(priorities),
        status: status,
        customerId: customer.id,
        assignedToId: assignedAgent?.id,
        createdAt: createdDate,
        resolvedAt: resolvedDate
      }
    })

    // 5. Add Feedback for Closed Tickets (CSAT Data)
    if (resolvedDate && randomInt(0, 10) > 2) { // 80% chance of feedback if resolved
      await prisma.feedback.create({
        data: {
          rating: randomInt(1, 5), // Random 1-5 stars
          comment: randomItem(['Great service!', 'Took too long.', 'Average.', 'Very helpful thanks.', 'Fixed my issue.']),
          ticketId: ticket.id
        }
      })
    }

    // 6. Add Random Comments
    if (assignedAgent) {
      await prisma.comment.create({
        data: {
          content: "I am looking into this issue now.",
          userId: assignedAgent.id,
          ticketId: ticket.id,
          isInternal: false
        }
      })
    }
  }

  // 7. Create a Sample Case (For Manager)
  const caseMgr = await prisma.case.create({
    data: {
      title: "Major System Outage - Oct",
      description: "Tracking the server outage affecting all mobile users.",
      managerId: manager.id
    }
  })
  
  // Link 3 random tickets to this case
  const randomTickets = await prisma.ticket.findMany({ take: 3 })
  for (const t of randomTickets) {
    await prisma.caseTicket.create({
      data: { caseId: caseMgr.id, ticketId: t.id }
    })
  }

  console.log("✅ Database Seeded with Real-Life Data (50+ Tickets)!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })