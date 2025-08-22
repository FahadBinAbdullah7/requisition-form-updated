"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TicketIcon, CheckCircle, Clock, Users, LogIn } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalTickets: number
  ticketsSolved: number
  workInProgress: number
  pendingReview: number
  activeTeams: number
  avgResolutionTime: string
}

export default function PublicDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTickets: 0,
    ticketsSolved: 0,
    workInProgress: 0,
    pendingReview: 0,
    activeTeams: 44,
    avgResolutionTime: "2.3 days",
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        const data = await response.json()

        if (data.success) {
          setDashboardStats(data.stats)
        } else {
          console.error("Failed to fetch dashboard data:", data.message)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
              <p className="text-muted-foreground mt-1">Real-time ticket statistics and team performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/create-ticket">
                <Button variant="outline">Submit Ticket</Button>
              </Link>
              <Link href="/login">
                <Button className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dashboardStats.totalTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Solved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dashboardStats.ticketsSolved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent font-medium">+8%</span> resolution rate
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Work in Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dashboardStats.workInProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg. {dashboardStats.avgResolutionTime} to complete</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{dashboardStats.pendingReview}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{dashboardStats.activeTeams}</div>
              <p className="text-xs text-muted-foreground mt-1">Teams working on tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Resolution Time</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{dashboardStats.avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground mt-1">Time to completion</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Operations Ticket System</CardTitle>
            <p className="text-sm text-muted-foreground">
              Submit tickets and track the progress of your requests through our operations team
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">How it works:</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <p>Submit your ticket with detailed requirements and timeline</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <p>Our team reviews and assigns the ticket to the appropriate department</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <p>Track progress and receive updates on your ticket status</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Our Teams:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded text-center">SMD</div>
                  <div className="p-2 bg-muted rounded text-center">QAC</div>
                  <div className="p-2 bg-muted rounded text-center">CM</div>
                  <div className="p-2 bg-muted rounded text-center">Class Ops</div>
                  <div className="p-2 bg-muted rounded text-center col-span-2">Content Operations</div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Link href="/create-ticket">
                <Button size="lg" className="w-full md:w-auto">
                  Submit New Ticket
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
