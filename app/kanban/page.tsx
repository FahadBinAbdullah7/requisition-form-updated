"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  selected?: boolean
  assigneeId?: string
}

interface KanbanColumn {
  id: string
  title: string
  status: "todo" | "in-progress" | "review" | "done"
  color: string
  tickets: Ticket[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: "Admin" | "Manager" | "Member"
  team: string
  status: "Active" | "Inactive"
}

interface Project {
  id: string
  name: string
  description: string
  tickets: string[]
  assignedMembers: string[]
  status: "Planning" | "Active" | "Completed"
  createdDate: string
  priority?: "Low" | "Medium" | "High" | "Urgent"
  dueDate?: string
  hasKanban?: boolean
}

export default function KanbanBoard() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null)
  const [showTicketSelector, setShowTicketSelector] = useState(false)
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [projectName, setProjectName] = useState("")
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "Promotional",
    priority: "Medium" as Ticket["priority"],
    assignee: "",
    team: "",
    dueDate: "",
  })
  const [teams, setTeams] = useState<string[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: "todo",
      title: "To Do",
      status: "todo",
      color: "bg-gray-100 border-gray-200",
      tickets: [],
    },
    {
      id: "in-progress",
      title: "In Progress",
      status: "in-progress",
      color: "bg-blue-50 border-blue-200",
      tickets: [],
    },
    {
      id: "review",
      title: "Review",
      status: "review",
      color: "bg-yellow-50 border-yellow-200",
      tickets: [],
    },
    {
      id: "done",
      title: "Done",
      status: "done",
      color: "bg-green-50 border-green-200",
      tickets: [],
    },
  ])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTeams = localStorage.getItem("teams")
      if (savedTeams) {
        try {
          const parsedTeams = JSON.parse(savedTeams)
          setTeams(
            Array.isArray(parsedTeams)
              ? parsedTeams.map((team: any) => team.name || "Unknown")
              : []
          )
        } catch (error) {
          console.error("Failed to parse teams from localStorage:", error)
          setTeams([])
        }
      }

      const savedUsers = localStorage.getItem("users")
      if (savedUsers) {
        try {
          const parsedUsers = JSON.parse(savedUsers)
          setTeamMembers(
            Array.isArray(parsedUsers)
              ? parsedUsers.map((user: any) => ({
                  id: user.id || `user_${Date.now()}`,
                  name: user.name || "Unknown",
                  email: user.email || "",
                  role: user.role || "Member",
                  team: user.team || "Unassigned",
                  status: user.status || "Active",
                }))
              : []
          )
        } catch (error) {
          console.error("Failed to parse users from localStorage:", error)
          setTeamMembers([])
        }
      }

      const savedProjects = localStorage.getItem("projects")
      let projects: Project[] = savedProjects ? JSON.parse(savedProjects) : []

      if (projectId) {
        const foundProject = projects.find((p: Project) => p.id === projectId)
        if (foundProject) {
          setProject(foundProject)
        } else {
          console.error(`Project with ID ${projectId} not found`)
          setProject(null)
        }
      } else {
        let universalProject = projects.find((p: Project) => p.id === "universal")
        if (!universalProject) {
          universalProject = {
            id: "universal",
            name: "Universal Kanban",
            description: "Tasks not assigned to a specific project",
            tickets: [],
            assignedMembers: [],
            status: "Active",
            createdDate: new Date().toISOString().split("T")[0],
            hasKanban: true,
          }
          projects.push(universalProject)
          localStorage.setItem("projects", JSON.stringify(projects))
        }
        setProject(universalProject)
      }
    }
  }, [projectId])

  useEffect(() => {
    const loadTickets = async () => {
      try {
        let tickets: any[] = []
        if (typeof window !== "undefined") {
          const savedTickets = localStorage.getItem("tickets")
          if (savedTickets) {
            try {
              tickets = JSON.parse(savedTickets)
              if (!Array.isArray(tickets)) {
                console.error("Invalid tickets data in localStorage, resetting to empty array")
                tickets = []
              }
            } catch (error) {
              console.error("Failed to parse tickets from localStorage:", error)
              tickets = []
            }
          }
        }

        const response = await fetch("/api/tickets")
        if (response.ok) {
          const data = await response.json()
          tickets = data.tickets || data
        } else {
          console.warn("API /api/tickets returned non-200 status:", response.status)
        }

        console.log("Raw tickets from localStorage/API:", tickets)

        const kanbanTickets = tickets.map((ticket: any) => {
          console.log("Raw ticket data:", ticket)
          const title = ticket.productName || ticket.title || ticket.name || "Untitled"
          const assigneeName =
            ticket.assignee ||
            ticket.assigneeName ||
            ticket.submitterName ||
            ticket.assignedTo ||
            "Unassigned"
          const assigneeId = ticket.assigneeId || ticket.submitterId || ""
          const member = teamMembers.find((m) => m.id === assigneeId || m.name === assigneeName)

          return {
            id: ticket.id || `TKT-${Date.now()}`,
            title,
            description: ticket.details || ticket.description || "",
            type: ticket.type || "Promotional",
            priority: ticket.priority || "Medium",
            assignee: {
              name: member ? member.name : assigneeName,
              avatar: member ? member.avatar || "" : "",
              initials: (member ? member.name : assigneeName)
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2),
            },
            team: ticket.team || "Unassigned",
            dueDate: ticket.deliveryTimeline || ticket.dueDate || ticket.createdDate || "",
            createdDate: ticket.createdDate || new Date().toISOString().split("T")[0],
            status:
              ticket.status === "Open"
                ? "todo"
                : ticket.status === "In Progress"
                  ? "in-progress"
                  : ticket.status === "Review"
                    ? "review"
                    : ticket.status === "Completed"
                      ? "done"
                      : "todo",
            tags: [ticket.type || "Promotional", ticket.priority || "Medium"],
            selected: ticket.selected || false,
            assigneeId: assigneeId || "",
          }
        })

        let filteredTickets: Ticket[] = []
        if (projectId && project) {
          filteredTickets = kanbanTickets.filter((ticket: Ticket) =>
            project.tickets.includes(ticket.id)
          )
        } else if (project && project.id === "universal") {
          filteredTickets = kanbanTickets.filter((ticket: Ticket) =>
            project.tickets.includes(ticket.id)
          )
        } else {
          filteredTickets = kanbanTickets.filter((ticket: Ticket) => ticket.selected)
        }

        if (filteredTickets.length === 0) {
          console.warn(
            `No tickets found. projectId: ${projectId}, project:`,
            project,
            "selected tickets:",
            kanbanTickets.filter((t: Ticket) => t.selected)
          )
        }

        setAvailableTickets(filteredTickets)
        setColumns((prevColumns) =>
          prevColumns.map((column) => ({
            ...column,
            tickets: filteredTickets.filter((ticket: Ticket) => ticket.status === column.status),
          }))
        )
      } catch (error) {
        console.error("[v0] Failed to load tickets:", error)
        setAvailableTickets([])
        setColumns((prevColumns) =>
          prevColumns.map((column) => ({ ...column, tickets: [] }))
        )
      }
    }

    loadTickets()
  }, [projectId, project, teamMembers])

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

    if (!draggedTicket) {
      console.warn("No dragged ticket found")
      return
    }

    const targetStatus = targetColumnId as Ticket["status"]
    const updatedTicket = { ...draggedTicket, status: targetStatus }

    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tickets:
          column.id === targetColumnId
            ? [...column.tickets.filter((t) => t.id !== draggedTicket.id), updatedTicket]
            : column.tickets.filter((t) => t.id !== draggedTicket.id),
      }))
    )

    setAvailableTickets((prev) =>
      prev.map((ticket) => (ticket.id === draggedTicket.id ? updatedTicket : ticket))
    )

    if (typeof window !== "undefined") {
      try {
        const savedTickets = localStorage.getItem("tickets")
        let tickets = savedTickets ? JSON.parse(savedTickets) : []
        if (!Array.isArray(tickets)) {
          console.error("Invalid tickets data in localStorage, resetting to empty array")
          tickets = []
        }

        const updatedTickets = tickets.map((t: any) =>
          t.id === draggedTicket.id
            ? {
                ...t,
                status:
                  targetStatus === "todo"
                    ? "Open"
                    : targetStatus === "in-progress"
                      ? "In Progress"
                      : targetStatus === "review"
                        ? "Review"
                        : "Completed",
                title: t.title || t.productName || draggedTicket.title,
                assignee: t.assignee || t.assigneeName || t.submitterName || draggedTicket.assignee.name,
                assigneeId: t.assigneeId || draggedTicket.assigneeId || "",
                selected: true,
              }
            : t
        )

        if (!updatedTickets.some((t: any) => t.id === draggedTicket.id)) {
          console.warn(`Ticket ${draggedTicket.id} not found in localStorage, adding it`)
          updatedTickets.push({
            id: draggedTicket.id,
            title: draggedTicket.title,
            description: draggedTicket.description,
            type: draggedTicket.type,
            priority: draggedTicket.priority,
            assignee: draggedTicket.assignee.name,
            assigneeId: draggedTicket.assigneeId || "",
            team: draggedTicket.team,
            dueDate: draggedTicket.dueDate,
            createdDate: draggedTicket.createdDate,
            status:
              targetStatus === "todo"
                ? "Open"
                : targetStatus === "in-progress"
                  ? "In Progress"
                  : targetStatus === "review"
                    ? "Review"
                    : "Completed",
            selected: true,
          })
        }

        localStorage.setItem("tickets", JSON.stringify(updatedTickets))

        const savedProjects = localStorage.getItem("projects")
        let projects = savedProjects ? JSON.parse(savedProjects) : []
        const targetProjectId = projectId || "universal"
        let targetProject = projects.find((p: Project) => p.id === targetProjectId)

        if (!targetProject) {
          targetProject = {
            id: "universal",
            name: "Universal Kanban",
            description: "Tasks not assigned to a specific project",
            tickets: [],
            assignedMembers: [],
            status: "Active",
            createdDate: new Date().toISOString().split("T")[0],
            hasKanban: true,
          }
          projects.push(targetProject)
        }

        const updatedProjects = projects.map((p: Project) =>
          p.id === targetProjectId
            ? { ...p, tickets: [...p.tickets.filter((id: string) => id !== draggedTicket.id), draggedTicket.id] }
            : p
        )
        localStorage.setItem("projects", JSON.stringify(updatedProjects))
        setProject((prev) =>
          prev && prev.id === targetProjectId
            ? { ...prev, tickets: [...prev.tickets.filter((id: string) => id !== draggedTicket.id), draggedTicket.id] }
            : targetProject
        )

        console.log(`Updated ticket ${draggedTicket.id} to status ${targetStatus} in project ${targetProjectId}`)
      } catch (error) {
        console.error("Failed to update localStorage:", error)
      }
    }

    setDraggedTicket(null)
  }

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          tickets: column.tickets.filter((ticket) => ticket.id !== ticketId),
        }))
      )

      setAvailableTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId))

      if (typeof window !== "undefined") {
        try {
          const savedTickets = localStorage.getItem("tickets")
          const tickets = savedTickets ? JSON.parse(savedTickets) : []
          const updatedTickets = tickets.filter((t: any) => t.id !== ticketId)
          localStorage.setItem("tickets", JSON.stringify(updatedTickets))

          const savedProjects = localStorage.getItem("projects")
          if (savedProjects) {
            const projects = JSON.parse(savedProjects)
            const updatedProjects = projects.map((p: Project) => ({
              ...p,
              tickets: p.tickets.filter((id: string) => id !== ticketId),
            }))
            localStorage.setItem("projects", JSON.stringify(updatedProjects))
            if (project && project.id === projectId) {
              setProject({ ...project, tickets: project.tickets.filter((id) => id !== ticketId) })
            }
          }
        } catch (error) {
          console.error("Failed to update localStorage on delete:", error)
        }
      }
    }
  }

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.assignee || !newTask.team) {
      alert("Please fill in all required fields")
      return
    }

    const assignedMember = teamMembers.find((member) => member.id === newTask.assignee)
    if (!assignedMember) {
      console.error("Assigned member not found")
      return
    }

    const task: Ticket = {
      id: `TKT-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      type: newTask.type,
      priority: newTask.priority,
      assignee: {
        name: assignedMember.name,
        avatar: "",
        initials: assignedMember.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2),
      },
      team: newTask.team,
      dueDate: newTask.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
      status: "todo",
      tags: [newTask.type, newTask.priority],
      selected: true,
      assigneeId: newTask.assignee,
    }

    setColumns((prevColumns) =>
      prevColumns.map((column) => (column.id === "todo" ? { ...column, tickets: [...column.tickets, task] } : column))
    )

    setAvailableTickets((prev) => [...prev, task])

    if (typeof window !== "undefined") {
      try {
        const savedTickets = localStorage.getItem("tickets")
        let tickets = savedTickets ? JSON.parse(savedTickets) : []
        if (!Array.isArray(tickets)) {
          console.error("Invalid tickets data in localStorage, resetting to empty array")
          tickets = []
        }
        const newTicket = {
          id: task.id,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          assignee: task.assignee.name,
          assigneeId: task.assigneeId,
          team: task.team,
          dueDate: task.dueDate,
          createdDate: task.createdDate,
          status: "Open",
          selected: true,
        }
        tickets = [...tickets.filter((t: any) => t.id !== task.id), newTicket]
        localStorage.setItem("tickets", JSON.stringify(tickets))

        const savedProjects = localStorage.getItem("projects")
        let projects = savedProjects ? JSON.parse(savedProjects) : []
        const targetProjectId = projectId || "universal"
        let targetProject = projects.find((p: Project) => p.id === targetProjectId)

        if (!targetProject) {
          targetProject = {
            id: "universal",
            name: "Universal Kanban",
            description: "Tasks not assigned to a specific project",
            tickets: [],
            assignedMembers: [],
            status: "Active",
            createdDate: new Date().toISOString().split("T")[0],
            hasKanban: true,
          }
          projects.push(targetProject)
        }

        const updatedProjects = projects.map((p: Project) =>
          p.id === targetProjectId
            ? { ...p, tickets: [...p.tickets.filter((id: string) => id !== task.id), task.id] }
            : p
        )
        localStorage.setItem("projects", JSON.stringify(updatedProjects))
        setProject((prev) =>
          prev && prev.id === targetProjectId
            ? { ...prev, tickets: [...prev.tickets.filter((id: string) => id !== task.id), task.id] }
            : targetProject
        )
        console.log(`Added ticket ${task.id} to project ${targetProjectId} in localStorage`)
      } catch (error) {
        console.error("Failed to update localStorage for new task:", error)
      }
    }

    setNewTask({
      title: "",
      description: "",
      type: "Promotional",
      priority: "Medium",
      assignee: "",
      team: "",
      dueDate: "",
    })
    setShowAddTask(false)
  }

  const handleCreateProject = () => {
    if (!projectName.trim() || selectedTickets.length === 0) {
      alert("Please enter a project name and select at least one ticket")
      return
    }

    const projectTickets = availableTickets
      .filter((ticket) => selectedTickets.includes(ticket.id))
      .map((ticket) => ({ ...ticket, status: "todo", selected: true }))

    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === "todo"
          ? { ...column, tickets: [...column.tickets, ...projectTickets] }
          : { ...column, tickets: column.tickets.filter((ticket) => !selectedTickets.includes(ticket.id)) }
      )
    )

    setAvailableTickets((prev) =>
      prev.map((ticket) => (selectedTickets.includes(ticket.id) ? { ...ticket, status: "todo", selected: true } : ticket))
    )

    if (typeof window !== "undefined") {
      try {
        const savedTickets = localStorage.getItem("tickets")
        const tickets = savedTickets ? JSON.parse(savedTickets) : []
        const updatedTickets = tickets.map((t: any) =>
          selectedTickets.includes(t.id)
            ? {
                ...t,
                status: "Open",
                selected: true,
                title: t.title || t.productName || "Untitled",
                assignee: t.assignee || t.assigneeName || t.submitterName || "Unassigned",
                assigneeId: t.assigneeId || teamMembers.find((m) => m.name === (t.assignee || t.assigneeName || t.submitterName))?.id || "",
              }
            : t
        )
        localStorage.setItem("tickets", JSON.stringify(updatedTickets))

        const savedProjects = localStorage.getItem("projects")
        const projects = savedProjects ? JSON.parse(savedProjects) : []
        const newProject: Project = {
          id: `project_${Date.now()}`,
          name: projectName,
          description: "",
          tickets: selectedTickets,
          assignedMembers: [],
          status: "Planning",
          createdDate: new Date().toISOString().split("T")[0],
          hasKanban: true,
        }
        projects.push(newProject)
        localStorage.setItem("projects", JSON.stringify(projects))
        console.log(`Created project ${newProject.id} with ${selectedTickets.length} selected tickets`)
      } catch (error) {
        console.error("Failed to update localStorage for new project:", error)
      }
    }

    setProjectName("")
    setSelectedTickets([])
    setShowTicketSelector(false)
    alert(`Project "${projectName}" created with ${selectedTickets.length} tickets!`)
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tickets: column.tickets.filter((ticket) => {
      const matchesTeam = selectedTeam === "all" || ticket.team.split(" & ").includes(selectedTeam)
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
      <NavigationHeader
        title={project ? `Kanban Board: ${project.name}` : "Kanban Board"}
        subtitle="Manage and track team tasks visually"
        backUrl="/dashboard"
      />

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
              <>
                <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Task Title</label>
                        <Input
                          value={newTask.title}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter task title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          value={newTask.description}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter task description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select
                            value={newTask.type}
                            onValueChange={(value) => setNewTask((prev) => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Promotional">Promotional</SelectItem>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Recorded">Recorded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priority</label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value) =>
                              setNewTask((prev) => ({ ...prev, priority: value as Ticket["priority"] }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Assign To</label>
                          <Select
                            value={newTask.assignee}
                            onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignee: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers
                                .filter((member) => member.status === "Active")
                                .map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} ({member.team})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Team</label>
                          <Select
                            value={newTask.team}
                            onValueChange={(value) => setNewTask((prev) => ({ ...prev, team: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddTask(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTask}>Add Task</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {!projectId && (
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
                            {availableTickets.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No available tickets to create projects from
                              </p>
                            ) : (
                              availableTickets.map((ticket) => (
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
                              ))
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowTicketSelector(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProject} disabled={selectedTickets.length === 0}>
                            Create Project ({selectedTickets.length} tickets)
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`rounded-t-lg border-2 ${column.color} p-4`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{column.title}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {column.tickets.length}
                  </Badge>
                </div>
              </div>

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

                {user?.role === "admin" && (
                  <Button
                    variant="ghost"
                    className="w-full border-2 border-dashed border-muted-foreground/25 h-12 text-muted-foreground hover:border-muted-foreground/50"
                    onClick={() => setShowAddTask(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add ticket
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
