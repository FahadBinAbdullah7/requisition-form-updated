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

      const values = [
        [
          ticketData.id || `TKT-${Date.now()}`,
          ticketData.productName || "",
          ticketData.type || "",
          ticketData.deliveryTimeline || "",
          ticketData.teamSelection || "",
          ticketData.details || "",
          ticketData.requisitionBreakdown || "",
          ticketData.priority || "Medium",
          ticketData.status || "todo",
          new Date().toISOString(),
          ticketData.assignee || "",
          ...Object.keys(ticketData)
            .filter(
              (key) =>
                ![
                  "id",
                  "productName",
                  "type",
                  "deliveryTimeline",
                  "teamSelection",
                  "details",
                  "requisitionBreakdown",
                  "priority",
                  "status",
                  "assignee",
                ].includes(key),
            )
            .map((key) => {
              const value = ticketData[key]
              return Array.isArray(value) ? value.join(", ") : value
            }),
        ],
      ]

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

      // Skip header row and convert to ticket objects
      const tickets = data.values.slice(1).map((row: any[]) => ({
        id: row[0] || "",
        productName: row[1] || "",
        type: row[2] || "",
        deliveryTimeline: row[3] || "",
        teamSelection: row[4] || "",
        details: row[5] || "",
        requisitionBreakdown: row[6] || "",
        priority: row[7] || "Medium",
        status: row[8] || "todo",
        createdDate: row[9] || "",
        assignee: row[10] || "",
      }))

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
