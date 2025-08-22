"use client"

import type React from "react"

import { useState } from "react"
import { NavigationHeader } from "@/components/navigation-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Users, Calendar, Trash2, FolderPlus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface Ticket {
  id: string
  title: string
  description: string
  type: string
  priority: "Low" | "Medium" | "High" | "Critical"
  assignee: {
    name: string
    avatar: string
    initials: string
  }
  team: string
  dueDate: string
  createdDate: string
  status: "todo" | "in-progress" | "review" | "done"
  tags: string[]
}

interface KanbanColumn {
  id: string
  title: string
  status: "todo" | "in-progress" | "review" | "done"
  color: string
  tickets: Ticket[]
}

export default function KanbanBoard() {
  const { user } = useAuth()
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null)
  const [showTicketSelector, setShowTicketSelector] = useState(false)
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [projectName, setProjectName] = useState("")

  const [availableTickets] = useState<Ticket[]>([
    {
      id: "TKT-007",
      title: "Mobile App Performance Optimization",
      description: "Optimize mobile app performance and reduce loading times",
      type: "Technical",
      priority: "High",
      assignee: { name: "John Doe", avatar: "", initials: "JD" },
      team: "Mobile Development",
      dueDate: "2025-01-30",
      createdDate: "2025-01-22",
      status: "todo",
      tags: ["Performance", "Mobile", "Optimization"],
    },
    {
      id: "TKT-008",
      title: "Email Marketing Campaign",
      description: "Create and launch quarterly email marketing campaign",
      type: "Marketing",
      priority: "Medium",
      assignee: { name: "Jane Smith", avatar: "", initials: "JS" },
      team: "Email Marketing",
      dueDate: "2025-02-05",
      createdDate: "2025-01-23",
      status: "todo",
      tags: ["Email", "Campaign", "Marketing"],
    },
  ])

  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: "todo",
      title: "To Do",
      status: "todo",
      color: "bg-gray-100 border-gray-200",
      tickets: [
        {
          id: "TKT-001",
          title: "Product Launch Campaign Setup",
          description:
            "Create comprehensive marketing campaign for new product launch including social media, email, and web content.",
          type: "Marketing",
          priority: "High",
          assignee: {
            name: "Sarah Johnson",
            avatar: "/diverse-woman-portrait.png",
            initials: "SJ",
          },
          team: "Digital Marketing",
          dueDate: "2025-01-25",
          createdDate: "2025-01-20",
          status: "todo",
          tags: ["Campaign", "Launch", "Social Media"],
        },
        {
          id: "TKT-004",
          title: "User Onboarding Flow Redesign",
          description: "Redesign the user onboarding experience to improve conversion rates.",
          type: "Design",
          priority: "Medium",
          assignee: {
            name: "Jessica Kim",
            avatar: "/serene-asian-woman.png",
            initials: "JK",
          },
          team: "UX/UI Design",
          dueDate: "2025-01-28",
          createdDate: "2025-01-21",
          status: "todo",
          tags: ["UX", "Onboarding", "Conversion"],
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      status: "in-progress",
      color: "bg-blue-50 border-blue-200",
      tickets: [
        {
          id: "TKT-002",
          title: "Database Migration Requirements",
          description: "Document requirements and plan for migrating legacy database to new infrastructure.",
          type: "Technical",
          priority: "Critical",
          assignee: {
            name: "Mike Chen",
            avatar: "/thoughtful-asian-man.png",
            initials: "MC",
          },
          team: "DevOps",
          dueDate: "2025-01-23",
          createdDate: "2025-01-18",
          status: "in-progress",
          tags: ["Database", "Migration", "Infrastructure"],
        },
        {
          id: "TKT-005",
          title: "Customer Feedback Analysis",
          description: "Analyze recent customer feedback and create actionable insights report.",
          type: "Research",
          priority: "Medium",
          assignee: {
            name: "Emily Davis",
            avatar: "/blonde-woman-portrait.png",
            initials: "ED",
          },
          team: "Customer Success",
          dueDate: "2025-01-26",
          createdDate: "2025-01-19",
          status: "in-progress",
          tags: ["Research", "Feedback", "Analysis"],
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      status: "review",
      color: "bg-yellow-50 border-yellow-200",
      tickets: [
        {
          id: "TKT-006",
          title: "API Documentation Update",
          description: "Update API documentation with new endpoints and authentication methods.",
          type: "Documentation",
          priority: "Low",
          assignee: {
            name: "Alex Rodriguez",
            avatar: "/hispanic-man.png",
            initials: "AR",
          },
          team: "Product Management",
          dueDate: "2025-01-24",
          createdDate: "2025-01-17",
          status: "review",
          tags: ["Documentation", "API", "Technical"],
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      status: "done",
      color: "bg-green-50 border-green-200",
      tickets: [
        {
          id: "TKT-003",
          title: "Customer Onboarding Process",
          description: "Streamline customer onboarding process and create automated workflows.",
          type: "Operations",
          priority: "Medium",
          assignee: {
            name: "Emily Davis",
            avatar: "/blonde-woman-portrait.png",
            initials: "ED",
          },
          team: "Customer Success",
          dueDate: "2025-01-22",
          createdDate: "2025-01-15",
          status: "done",
          tags: ["Process", "Automation", "Workflow"],
        },
      ],
    },
  ])

  const teams = ["Digital Marketing", "DevOps", "Customer Success", "Product Management", "UX/UI Design"]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    setDraggedTicket(ticket)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()

    if (!draggedTicket) return

    const targetStatus = targetColumnId as Ticket["status"]

    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tickets:
          column.id === targetColumnId
            ? [...column.tickets.filter((t) => t.id !== draggedTicket.id), { ...draggedTicket, status: targetStatus }]
            : column.tickets.filter((t) => t.id !== draggedTicket.id),
      })),
    )

    setDraggedTicket(null)
  }

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          tickets: column.tickets.filter((ticket) => ticket.id !== ticketId),
        })),
      )
    }
  }

  const handleCreateProject = () => {
    if (!projectName.trim() || selectedTickets.length === 0) {
      alert("Please enter a project name and select at least one ticket")
      return
    }

    const projectTickets = availableTickets.filter((ticket) => selectedTickets.includes(ticket.id))

    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === "todo" ? { ...column, tickets: [...column.tickets, ...projectTickets] } : column,
      ),
    )

    setProjectName("")
    setSelectedTickets([])
    setShowTicketSelector(false)
    alert(`Project "${projectName}" created with ${selectedTickets.length} tickets!`)
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tickets: column.tickets.filter((ticket) => {
      const matchesTeam = selectedTeam === "all" || ticket.team === selectedTeam
      const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority
      const matchesSearch =
        searchQuery === "" ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesTeam && matchesPriority && matchesSearch
    }),
  }))

  const totalTickets = columns.reduce((sum, column) => sum + column.tickets.length, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <NavigationHeader title="Kanban Board" subtitle="Manage and track team tasks visually" backUrl="/dashboard" />

      {/* Filters */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {totalTickets} tickets
            </Badge>
            {user?.role === "admin" && (
              <Dialog open={showTicketSelector} onOpenChange={setShowTicketSelector}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <FolderPlus className="h-4 w-4" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Project from Tickets</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Project Name</label>
                      <Input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Select Tickets</label>
                      <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                        {availableTickets.map((ticket) => (
                          <div key={ticket.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={selectedTickets.includes(ticket.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTickets((prev) => [...prev, ticket.id])
                                } else {
                                  setSelectedTickets((prev) => prev.filter((id) => id !== ticket.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                  {ticket.priority}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm">{ticket.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{ticket.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowTicketSelector(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProject}>Create Project ({selectedTickets.length} tickets)</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Link href="/create-ticket">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`rounded-t-lg border-2 ${column.color} p-4`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{column.title}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {column.tickets.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div
                className={`flex-1 border-l-2 border-r-2 border-b-2 ${column.color.replace("bg-", "border-").split(" ")[1]} rounded-b-lg p-4 space-y-4 min-h-96`}
              >
                {column.tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-sm font-medium leading-tight">{ticket.title}</CardTitle>
                        </div>
                        {user?.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteTicket(ticket.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{ticket.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ticket.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {ticket.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            +{ticket.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={ticket.assignee.avatar || "/placeholder.svg"}
                              alt={ticket.assignee.name}
                            />
                            <AvatarFallback className="text-xs">{ticket.assignee.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{ticket.assignee.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {ticket.dueDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Ticket Button */}
                <Button
                  variant="ghost"
                  className="w-full border-2 border-dashed border-muted-foreground/25 h-12 text-muted-foreground hover:border-muted-foreground/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add ticket
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
