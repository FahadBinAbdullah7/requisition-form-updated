// Google Sheets API integration utilities
import { SignJWT, importPKCS8 } from "jose"

interface GoogleSheetsConfig {
  spreadsheetId: string
  serviceAccountKey: any
}

interface TicketData {
  id: string
  productName: string
  type: string
  deliveryTimeline: string
  teamSelection: string
  details: string
  requisitionBreakdown: string
  priority: string
  status: string
  createdDate: string
  assignee?: string
}

interface ProjectData {
  id: string
  projectName: string
  description: string
  ticketIds: string[]
  assignedTeam: string
  assignedMembers: string[]
  priority: string
  dueDate: string
  status: string
  createdDate: string
  createdBy: string
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null
  private accessToken: string | null = null

  constructor() {
    // Initialize with environment variables or config
    this.initializeConfig()
  }

  private initializeConfig() {
    this.config = {
      spreadsheetId: "1OShk01LUXySNK93ZXMk5NWARXWkNlnTjdCXooIHhQ5U",
      serviceAccountKey: {
        type: "service_account",
        project_id: "pelagic-range-466218-p1",
        private_key_id: "a94c2fbe1cdbbf8d303ba73de4a833b224ca626d",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCk38vIK+mRrLC6\nQNflraVEmv6ufxIzswb6RQZgAX4QFEP3Rlj+4oPMwjIdLHPXLRsKv9TfycjwJTfk\nYMsHK29Md5BnJ1Q1TNe5muh4bWZRAHW3zHOlAMYyewlU/aczGRBvc6k1gax4hzDB\nXpi8YnQEdfhwFsbBIH1CqxhoHzkEK73He2TpS/kzNBhtiK6Rtjmx2taH9wCTkYc9\nXvtE9/ZD6FxwargD80vPz8tn7WroyTXJKx0+rMf7OCnqgKgtKd0u3IRdXyffs2Iu\noCMoZB7HBm42bZ3WcyQlOuyC48MawnafvF3Z7lvGCADVq8isyplvkaDFRkCIP0FS\nOYstZveVAgMBAAECggEAESYH24+ZsSGtlgnFiumXPX4DjGHCImd2C9TfF2BAXOrG\nsPL7sbMcs1DlhnxHpjNWUzVlrkseH8A3QoVAyMOfRWxQNDJ2gz61V2RB1rjGQhmS\npOXah2h/tONwMotZdyqdt4HnsR2GM1kYXJx6tWlmGMquZvYvgQngjW0fUkEhHIpH\nNkCzFbUmV4Aq/t/MnqQ7ya3VUAO8DNIpBpLJ78F3Ryc6E6L7FTU/KiVYT7h+rTRy\nztZEhlN4//5FZoXPTpwwvVgTLq33e8UJOQjV6UVV465eF0tY21TZcO9uxdA6buoT\nXhMH4b83jSpOx/l0RdvPPvskpqdmFc3f3aBD27MUQQKBgQDix73F1seQfeEoBmjY\ndK94/hCQinRsHOqB0K+9g2dD1w+Ljthl8EPImi29upZ+ti4dza+PfgAWGQZ0tSLz\npO6OhFP+0b74Hw2uyNliytYJKlgcXXueXMtndd3cKOWXd/0AWSFfXXDL/7m4h17B\nCrZxD/Sfwzs0dkbZAMGgVq5OdQKBgQC6HhumFHrnz4mjsXlZ5jzfnTbnfIqO4mR6\nU8+J+WVRkF/qLiCOMmTbK2YPNuU51knls/kqK2iczBUTUAXZeK8BBJlwisZuXj//\n5XbfO4BVOy0UXMAK+roqscWXznj4Fb+ciidSzsWVKxeoy5Qh94PwYq2i4bSkCFuH\nrWtRYvUgoQKBgCcAYRPQP1wLOhjPGWL4lmEBmMmy9hjN1ErlIARAwBa7utGujGrj\nqlSqp2k02MMMA9xeTm4oJk2mmiSiLlOmrtxVx7hQTD6R4KGJq1FBPxQucx7VuPfg\nT58Id1JwuiOVoC5aJdIn2MlMvp0MsvASLpQ9QT3krp70JHUXmzU/ExUtAoGBALMG\nCPRcmMhnse555M9bjsxNTiWmfyTnkVy1R1lhQlsNc6UvT3NX9/l1qksSM7XJcPV5\ngz9T1+GS0Obtv2KrGjLxeKJvamV5VThRQWGCu3PAYyFGAhfNistMilL2cRe428G4\nhhC6AgX1GGHtyIRPsGLGmFynnHl37Ir6fdMgS8dhAoGBAKRrHpDuGNwuzzG2ocUG\n0plGxx/Efei9FesQNGMnnHRG2tVcRZzs0NFzwu/Q4hY1b2jTfsI88ZQ0Xr0nKC87\nUhOVYSXOd+4wvtMi1QllnViE36Wo0V230rg4QqVs5WndnHAkUTXQwnAqCwaEOqH7\nAdIemxZqJ2/0pQnTLSSrygzI\n-----END PRIVATE KEY-----\n",
        client_email: "requisition-dashboard-edit@pelagic-range-466218-p1.iam.gserviceaccount.com",
        client_id: "107364221326667054499",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/requisition-dashboard-edit%40pelagic-range-466218-p1.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      },
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.config?.serviceAccountKey) {
      throw new Error("Google Sheets service account key not configured")
    }

    // Create JWT token for service account authentication
    const jwt = await this.createJWT()

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })

    const data = await response.json()
    this.accessToken = data.access_token
    return data.access_token
  }

  private async createJWT(): Promise<string> {
    if (!this.config?.serviceAccountKey) {
      throw new Error("Service account key not available")
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: this.config.serviceAccountKey.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }

    // Convert private key to proper format
    const privateKey = this.config.serviceAccountKey.private_key.replace(/\\n/g, "\n")

    try {
      // Import the private key as a KeyLike object
      const keyLike = await importPKCS8(privateKey, "RS256")

      const jwt = await new SignJWT(payload).setProtectedHeader({ alg: "RS256" }).sign(keyLike)

      return jwt
    } catch (error) {
      console.error("[v0] JWT signing error:", error)
      throw new Error("Failed to create JWT token")
    }
  }

  async appendTicket(ticketData: any): Promise<boolean> {
    try {
      if (!this.config?.spreadsheetId) {
        console.log("[v0] Google Sheets not configured, simulating submission")
        return true
      }

      const token = await this.getAccessToken()

      const headersResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet1!1:1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const headersData = await headersResponse.json()
      const headers = headersData.values?.[0] || []

      const rowData = new Array(headers.length).fill("")

      Object.keys(ticketData).forEach((key) => {
        const headerIndex = headers.findIndex(
          (header: string) =>
            header.toLowerCase().trim() === key.toLowerCase().trim() ||
            header
              .toLowerCase()
              .replace(/\s+/g, "")
              .replace(/[^a-z0-9]/gi, "") ===
              key
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9]/gi, ""),
        )

        if (headerIndex !== -1) {
          const value = ticketData[key]
          rowData[headerIndex] = Array.isArray(value) ? value.join(", ") : value || ""
        }
      })

      const idIndex = headers.findIndex((h: string) => h.toLowerCase().includes("id"))
      if (idIndex !== -1 && !rowData[idIndex]) {
        rowData[idIndex] = `TKT-${Date.now()}`
      }

      const statusIndex = headers.findIndex((h: string) => h.toLowerCase().includes("status"))
      if (statusIndex !== -1 && !rowData[statusIndex]) {
        rowData[statusIndex] = "todo"
      }

      const dateIndex = headers.findIndex(
        (h: string) => h.toLowerCase().includes("date") || h.toLowerCase().includes("created"),
      )
      if (dateIndex !== -1 && !rowData[dateIndex]) {
        rowData[dateIndex] = new Date().toISOString()
      }

      const values = [rowData]

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet1:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values,
          }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Google Sheets API error:", errorText)
        return false
      }

      console.log("[v0] Successfully submitted ticket to Google Sheets")
      return true
    } catch (error) {
      console.error("[v0] Error appending to Google Sheets:", error)
      return false
    }
  }

  async getTickets(): Promise<any[]> {
    try {
      if (!this.config?.spreadsheetId) {
        console.log("[v0] Google Sheets not configured, returning mock data")
        return this.getMockTickets()
      }

      const token = await this.getAccessToken()

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!data.values || data.values.length < 2) {
        return []
      }

      const headers = data.values[0]
      const tickets = data.values.slice(1).map((row: any[]) => {
        const ticket: any = {}

        headers.forEach((header: string, index: number) => {
          const cleanHeader = header
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9]/gi, "")
          let fieldName = header

          // Map common field names
          if (cleanHeader.includes("product") && cleanHeader.includes("name")) fieldName = "productName"
          else if (cleanHeader.includes("delivery") && cleanHeader.includes("timeline")) fieldName = "deliveryTimeline"
          else if (cleanHeader.includes("team") && cleanHeader.includes("selection")) fieldName = "teamSelection"
          else if (cleanHeader.includes("requisition") && cleanHeader.includes("breakdown"))
            fieldName = "requisitionBreakdown"
          else if (cleanHeader.includes("created") && cleanHeader.includes("date")) fieldName = "createdDate"
          else fieldName = header.replace(/\s+/g, "").toLowerCase()

          ticket[fieldName] = row[index] || ""
        })

        return ticket
      })

      return tickets
    } catch (error) {
      console.error("[v0] Error reading from Google Sheets:", error)
      return this.getMockTickets()
    }
  }

  private getMockTickets(): any[] {
    return [
      {
        id: "TKT-001",
        productName: "Product Launch Campaign Setup",
        type: "Marketing",
        deliveryTimeline: "2025-01-25",
        teamSelection: "Digital Marketing",
        details: "Create comprehensive marketing campaign for new product launch",
        requisitionBreakdown: "https://docs.google.com/spreadsheets/d/example",
        priority: "High",
        status: "todo",
        createdDate: "2025-01-20",
        assignee: "Sarah Johnson",
      },
      {
        id: "TKT-002",
        productName: "Database Migration Requirements",
        type: "Technical",
        deliveryTimeline: "2025-01-23",
        teamSelection: "DevOps",
        details: "Document requirements and plan for migrating legacy database",
        requisitionBreakdown: "",
        priority: "Critical",
        status: "in-progress",
        createdDate: "2025-01-18",
        assignee: "Mike Chen",
      },
      {
        id: "TKT-003",
        productName: "Customer Onboarding Process",
        type: "Operations",
        deliveryTimeline: "2025-01-22",
        teamSelection: "Customer Success",
        details: "Streamline customer onboarding process and create automated workflows",
        requisitionBreakdown: "",
        priority: "Medium",
        status: "done",
        createdDate: "2025-01-15",
        assignee: "Emily Davis",
      },
    ]
  }

  async appendProject(projectData: ProjectData): Promise<boolean> {
    try {
      if (!this.config?.spreadsheetId) {
        console.log("[v0] Google Sheets not configured, simulating project submission")
        return true
      }

      const token = await this.getAccessToken()

      // First, check if Sheet2 exists and get/create headers
      const headersResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet2!1:1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      let headers: string[] = []

      if (headersResponse.ok) {
        const headersData = await headersResponse.json()
        headers = headersData.values?.[0] || []
      }

      // If no headers exist, create them
      if (headers.length === 0) {
        headers = [
          "Project ID",
          "Project Name",
          "Description",
          "Ticket IDs",
          "Assigned Team",
          "Assigned Members",
          "Priority",
          "Due Date",
          "Status",
          "Created Date",
          "Created By",
        ]

        // Create headers in Sheet2
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet2!1:1?valueInputOption=RAW`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [headers],
            }),
          },
        )
      }

      // Map project data to row format
      const rowData = new Array(headers.length).fill("")

      const fieldMapping: { [key: string]: string } = {
        "Project ID": projectData.id,
        "Project Name": projectData.projectName,
        Description: projectData.description,
        "Ticket IDs": Array.isArray(projectData.ticketIds) ? projectData.ticketIds.join(", ") : projectData.ticketIds,
        "Assigned Team": projectData.assignedTeam,
        "Assigned Members": Array.isArray(projectData.assignedMembers)
          ? projectData.assignedMembers.join(", ")
          : projectData.assignedMembers,
        Priority: projectData.priority,
        "Due Date": projectData.dueDate,
        Status: projectData.status,
        "Created Date": projectData.createdDate,
        "Created By": projectData.createdBy,
      }

      headers.forEach((header, index) => {
        if (fieldMapping[header]) {
          rowData[index] = fieldMapping[header]
        }
      })

      const values = [rowData]

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet2:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values,
          }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Google Sheets API error for project:", errorText)
        return false
      }

      console.log("[v0] Successfully submitted project to Google Sheets Sheet2")
      return true
    } catch (error) {
      console.error("[v0] Error appending project to Google Sheets:", error)
      return false
    }
  }

  async getProjects(): Promise<ProjectData[]> {
    try {
      if (!this.config?.spreadsheetId) {
        console.log("[v0] Google Sheets not configured, returning mock projects")
        return this.getMockProjects()
      }

      const token = await this.getAccessToken()

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/Sheet2`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!data.values || data.values.length < 2) {
        return []
      }

      const headers = data.values[0]
      const projects = data.values.slice(1).map((row: any[]) => {
        const project: any = {}

        headers.forEach((header: string, index: number) => {
          const value = row[index] || ""

          // Handle array fields
          if (header === "Ticket IDs" || header === "Assigned Members") {
            project[header.toLowerCase().replace(/\s+/g, "")] = value ? value.split(", ") : []
          } else {
            project[header.toLowerCase().replace(/\s+/g, "")] = value
          }
        })

        return project as ProjectData
      })

      return projects
    } catch (error) {
      console.error("[v0] Error reading projects from Google Sheets:", error)
      return this.getMockProjects()
    }
  }

  private getMockProjects(): ProjectData[] {
    return [
      {
        id: "PRJ-001",
        projectName: "Q1 Marketing Campaign",
        description: "Complete marketing campaign for Q1 product launches",
        ticketIds: ["TKT-001", "TKT-004"],
        assignedTeam: "Digital Marketing",
        assignedMembers: ["Sarah Johnson", "Mike Chen"],
        priority: "High",
        dueDate: "2025-03-31",
        status: "in-progress",
        createdDate: "2025-01-20",
        createdBy: "Admin",
      },
    ]
  }

  async getDashboardStats() {
    const tickets = await this.getTickets()

    const totalTickets = tickets.length
    const ticketsSolved = tickets.filter((t) => t.status === "done").length
    const workInProgress = tickets.filter((t) => t.status === "in-progress").length
    const pendingReview = tickets.filter((t) => t.status === "review").length

    return {
      totalTickets,
      ticketsSolved,
      workInProgress,
      pendingReview,
      activeTeams: 44, // Static for now
      avgResolutionTime: "2.3 days", // Static for now
    }
  }

  async updateTicketStatus(ticketId: string, newStatus: string): Promise<boolean> {
    try {
      if (!this.config?.spreadsheetId) {
        console.log("[v0] Google Sheets not configured, simulating status update")
        return true
      }

      // In a real implementation, you'd find the row and update the status column
      // For now, we'll simulate success
      console.log(`[v0] Updating ticket ${ticketId} status to ${newStatus}`)
      return true
    } catch (error) {
      console.error("[v0] Error updating ticket status:", error)
      return false
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
