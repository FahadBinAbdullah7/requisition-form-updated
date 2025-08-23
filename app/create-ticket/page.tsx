"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Send } from "lucide-react"
import Link from "next/link"

// Default form fields as fallback (same as in AdminPanel)
const defaultFormFields: FormField[] = [
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
    options: ["Paid", "Promotional", "Recorded", "Others"],
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
    options: [
      "CM",
      "QAC",
      "SMD",
      "Class_OPS",
      "QAC & CM",
      "QAC & Class_OPS",
      "CM & Class_OPS",
      "SMD, QAC & CM",
      "SMD, QAC & Class_OPS",
      "SMD, CM & Class_OPS",
      "QAC, CM & Class_OPS",
      "SMD, QAC, CM & Class_OPS",
    ],
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
    required: true,
  },
]

interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "url" | "checkbox"
  required: boolean
  options?: string[]
}

export default function CreateTicket() {
  // Initialize formFields from localStorage or default
  const [formFields, setFormFields] = useState<FormField[]>(defaultFormFields)
  const [formData, setFormData] = useState<Record<string, any>>({
    priority: "Medium",
    submitterName: "", // Added for public users to input their name
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load formFields from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFormFields = localStorage.getItem("formFields")
      if (savedFormFields) {
        setFormFields(JSON.parse(savedFormFields))
      }
    }
  }, [])

  // Initialize formData based on formFields
  useEffect(() => {
    const initialFormData = formFields.reduce((acc, field) => {
      acc[field.id] = field.type === "checkbox" ? [] : ""
      return acc
    }, { priority: "Medium", submitterName: "" } as Record<string, any>)
    setFormData(initialFormData)
  }, [formFields])

  // Handle input changes
  const handleInputChange = (fieldId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldId] || []
    let newValues: string[]

    if (checked) {
      newValues = [...currentValues, option]
    } else {
      newValues = currentValues.filter((val: string) => val !== option)
    }

    handleInputChange(fieldId, newValues)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate required fields
    const missingFields = formFields
      .filter((field) => field.required && (!formData[field.id] || (Array.isArray(formData[field.id]) && formData[field.id].length === 0)))
      .map((field) => field.label)
    if (!formData.submitterName) {
      missingFields.push("Submitter Name")
    }
    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(", ")}`)
      setIsSubmitting(false)
      return
    }

    try {
      const ticket = {
        id: `ticket_${Date.now()}`,
        ...formData,
        createdDate: new Date().toISOString().split("T")[0],
        status: isDraft ? "Draft" : "Open",
        assignee: formData.submitterName, // Use submitterName as assignee
        team: formData.teamSelection || "Unassigned",
        isDraft,
      }

      // Save to localStorage
      if (typeof window !== "undefined") {
        const savedTickets = localStorage.getItem("tickets")
        const tickets = savedTickets ? JSON.parse(savedTickets) : []
        tickets.push(ticket)
        localStorage.setItem("tickets", JSON.stringify(tickets))
      }

      // Send to API
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)

        // Reset form after successful submission (except for drafts)
        if (!isDraft) {
          const resetData = formFields.reduce((acc, field) => {
            acc[field.id] = field.type === "checkbox" ? [] : ""
            return acc
          }, { priority: "Medium", submitterName: "" } as Record<string, any>)
          setFormData(resetData)
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("[v0] Submission error:", error)
      setError("Error submitting ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render form field based on type
  const renderField = (field: FormField) => {
    const value = formData[field.id] || (field.type === "checkbox" ? [] : "")

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={4}
            required={field.required}
            className="resize-none"
          />
        )

      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(value) => handleInputChange(field.id, value)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
            {field.required && value.length === 0 && (
              <p className="text-sm text-destructive">Please select at least one option</p>
            )}
          </div>
        )

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case "url":
        return (
          <Input
            id={field.id}
            type="url"
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder="https://docs.google.com/..."
            required={field.required}
          />
        )

      default:
        return (
          <Input
            id={field.id}
            type="text"
            value={value as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Ticket</h1>
              <p className="text-muted-foreground mt-1">Submit a new project or task request</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Submitter Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Submitter Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="submitterName" className="text-sm font-medium">
                  Your Name <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="submitterName"
                  type="text"
                  value={formData.submitterName as string}
                  onChange={(e) => handleInputChange("submitterName", e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Priority Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Priority Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {["Low", "Medium", "High", "Critical"].map((priority) => (
                  <Button
                    key={priority}
                    type="button"
                    variant={formData.priority === priority ? "default" : "outline"}
                    onClick={() => handleInputChange("priority", priority)}
                    className="flex-1"
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground">
              Fields marked with <span className="text-destructive">*</span> are required
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
