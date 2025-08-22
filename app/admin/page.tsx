"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { NavigationHeader } from "@/components/navigation-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, FileText, Plus, Trash2, Edit, Save, Database, UserPlus, Building } from "lucide-react"

interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "url" | "checkbox"
  required: boolean
  options?: string[]
}

interface Team {
  id: string
  name: string
  department: string
  manager: string
  members: number
  status: "Active" | "Inactive"
}

interface User {
  id: string
  name: string
  email: string
  role: "Admin" | "Manager" | "Member"
  team: string
  status: "Active" | "Inactive"
}

export default function AdminPanel() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      id: "productName",
      label: "Product/Course/Requisition Name",
      type: "text",
      required: true,
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      required: true,
      options: ["Marketing", "Technical", "Operations", "Design", "Content", "Research", "Support"],
    },
    {
      id: "deliveryTimeline",
      label: "Delivery Timeline",
      type: "date",
      required: true,
    },
    {
      id: "teamSelection",
      label: "Team Selection",
      type: "select",
      required: true,
      options: ["Digital Marketing", "DevOps", "Customer Success", "Product Management"],
    },
    {
      id: "details",
      label: "Details",
      type: "textarea",
      required: true,
    },
    {
      id: "requisitionBreakdown",
      label: "Requisition Breakdown (Google Sheet/Docs Link)",
      type: "url",
      required: false,
    },
  ])
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "1",
      name: "Digital Marketing",
      department: "Marketing",
      manager: "Sarah Johnson",
      members: 8,
      status: "Active",
    },
    { id: "2", name: "DevOps", department: "Engineering", manager: "Mike Chen", members: 6, status: "Active" },
    {
      id: "3",
      name: "Customer Success",
      department: "Operations",
      manager: "Emily Davis",
      members: 12,
      status: "Active",
    },
    {
      id: "4",
      name: "Product Management",
      department: "Product",
      manager: "Alex Rodriguez",
      members: 5,
      status: "Active",
    },
    { id: "5", name: "UX/UI Design", department: "Design", manager: "Jessica Kim", members: 7, status: "Active" },
  ])
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      role: "Manager",
      team: "Digital Marketing",
      status: "Active",
    },
    { id: "2", name: "Mike Chen", email: "mike.c@company.com", role: "Manager", team: "DevOps", status: "Active" },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily.d@company.com",
      role: "Manager",
      team: "Customer Success",
      status: "Active",
    },
    { id: "4", name: "John Admin", email: "admin@company.com", role: "Admin", team: "System", status: "Active" },
  ])
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newField, setNewField] = useState<Partial<FormField>>({
    label: "",
    type: "text",
    required: false,
  })
  const [showAddField, setShowAddField] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: "", department: "", manager: "" })
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Member", team: "" })
  const [showAddUser, setShowAddUser] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  // Form Field Management Functions
  const addFormField = () => {
    if (newField.label) {
      const field: FormField = {
        id: `field_${Date.now()}`,
        label: newField.label,
        type: newField.type || "text",
        required: newField.required || false,
        options: newField.options,
      }
      setFormFields((prev) => [...prev, field])
      setNewField({ label: "", type: "text", required: false })
      setShowAddField(false)
    }
  }

  const removeFormField = (fieldId: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== fieldId))
  }

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields((prev) => prev.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
    setEditingField(null)
  }

  // Team Management Functions
  const addTeam = () => {
    if (newTeam.name && newTeam.department && newTeam.manager) {
      const team: Team = {
        id: `team_${Date.now()}`,
        name: newTeam.name,
        department: newTeam.department,
        manager: newTeam.manager,
        members: 0,
        status: "Active",
      }
      setTeams((prev) => [...prev, team])
      setNewTeam({ name: "", department: "", manager: "" })
      setShowAddTeam(false)
    }
  }

  const removeTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId))
  }

  // User Management Functions
  const addUser = () => {
    if (newUser.name && newUser.email && newUser.team) {
      const user: User = {
        id: `user_${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as User["role"],
        team: newUser.team,
        status: "Active",
      }
      setUsers((prev) => [...prev, user])
      setNewUser({ name: "", email: "", role: "Member", team: "" })
      setShowAddUser(false)
    }
  }

  const removeUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
  }

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } : user,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <NavigationHeader title="Admin Panel" subtitle="Manage system configuration and users" backUrl="/dashboard" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="forms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Form Management
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Team Management
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          {/* Form Management Tab */}
          <TabsContent value="forms">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Dynamic Form Fields</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage the fields that appear in the ticket creation form
                  </p>
                </div>
                <Button onClick={() => setShowAddField(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      {editingField === field.id ? (
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Field Label</Label>
                              <Input
                                defaultValue={field.label}
                                onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                                placeholder="Enter field label"
                              />
                            </div>
                            <div>
                              <Label>Field Type</Label>
                              <Select
                                defaultValue={field.type}
                                onValueChange={(value) =>
                                  updateFormField(field.id, { type: value as FormField["type"] })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="url">URL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {(field.type === "select" || field.type === "checkbox") && (
                            <div>
                              <Label>Options (comma-separated)</Label>
                              <Input
                                defaultValue={field.options?.join(", ") || ""}
                                onChange={(e) =>
                                  updateFormField(field.id, {
                                    options: e.target.value.split(",").map((opt) => opt.trim()),
                                  })
                                }
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                defaultChecked={field.required}
                                onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                                className="rounded border-border"
                              />
                              <span className="text-sm">Required field</span>
                            </label>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingField(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => setEditingField(null)}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{field.label}</h3>
                              <Badge variant="outline">{field.type}</Badge>
                              {field.required && <Badge variant="secondary">Required</Badge>}
                            </div>
                            {field.options && (
                              <p className="text-sm text-muted-foreground mt-1">Options: {field.options.join(", ")}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingField(field.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFormField(field.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add New Field Form */}
                  {showAddField && (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Field Label</Label>
                              <Input
                                value={newField.label || ""}
                                onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                                placeholder="Enter field label"
                              />
                            </div>
                            <div>
                              <Label>Field Type</Label>
                              <Select
                                value={newField.type || "text"}
                                onValueChange={(value) =>
                                  setNewField((prev) => ({ ...prev, type: value as FormField["type"] }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="url">URL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {(newField.type === "select" || newField.type === "checkbox") && (
                            <div>
                              <Label>Options (comma-separated)</Label>
                              <Input
                                value={newField.options?.join(", ") || ""}
                                onChange={(e) =>
                                  setNewField((prev) => ({
                                    ...prev,
                                    options: e.target.value.split(",").map((opt) => opt.trim()),
                                  }))
                                }
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={newField.required || false}
                                onChange={(e) => setNewField((prev) => ({ ...prev, required: e.target.checked }))}
                                className="rounded border-border"
                              />
                              <span className="text-sm">Required field</span>
                            </label>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setShowAddField(false)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={addFormField}>
                                Add Field
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="teams">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage teams and their assignments ({teams.length} teams)
                  </p>
                </div>
                <Button onClick={() => setShowAddTeam(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Team
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{team.name}</h3>
                          <Badge variant="outline">{team.department}</Badge>
                          <Badge variant={team.status === "Active" ? "default" : "secondary"}>{team.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Manager: {team.manager} • {team.members} members
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeam(team.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Team Form */}
                  {showAddTeam && (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Team Name</Label>
                              <Input
                                value={newTeam.name}
                                onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter team name"
                              />
                            </div>
                            <div>
                              <Label>Department</Label>
                              <Input
                                value={newTeam.department}
                                onChange={(e) => setNewTeam((prev) => ({ ...prev, department: e.target.value }))}
                                placeholder="Enter department"
                              />
                            </div>
                            <div>
                              <Label>Manager</Label>
                              <Input
                                value={newTeam.manager}
                                onChange={(e) => setNewTeam((prev) => ({ ...prev, manager: e.target.value }))}
                                placeholder="Enter manager name"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowAddTeam(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={addTeam}>
                              Add Team
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage user accounts and permissions ({users.length} users)
                  </p>
                </div>
                <Button onClick={() => setShowAddUser(true)} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email} • Team: {user.team}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(user.id)}>
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add New User Form */}
                  {showAddUser && (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Full Name</Label>
                              <Input
                                value={newUser.name}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter full name"
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter email address"
                              />
                            </div>
                            <div>
                              <Label>Role</Label>
                              <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Member">Member</SelectItem>
                                  <SelectItem value="Manager">Manager</SelectItem>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Team</Label>
                              <Select
                                value={newUser.team}
                                onValueChange={(value) => setNewUser((prev) => ({ ...prev, team: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.name}>
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowAddUser(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={addUser}>
                              Add User
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Google Sheets Integration</CardTitle>
                  <p className="text-sm text-muted-foreground">Configure Google Sheets API for form submissions</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Spreadsheet ID</Label>
                    <Input placeholder="Enter Google Sheets ID" />
                  </div>
                  <div>
                    <Label>Service Account Key</Label>
                    <Textarea placeholder="Paste service account JSON key" rows={4} />
                  </div>
                  <Button className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Test Connection
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <p className="text-sm text-muted-foreground">General system settings and preferences</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Priority Level</Label>
                    <Select defaultValue="Medium">
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
                  <div>
                    <Label>Auto-assign Tickets</Label>
                    <Select defaultValue="manual">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Assignment</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="workload">Based on Workload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
