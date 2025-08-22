"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Send } from "lucide-react"
import Link from "next/link"

interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "url" | "checkbox"
  required: boolean
  options?: string[]
}

export default function CreateTicket() {
  const [formData, setFormData] = useState<Record<string, any>>({
    priority: "Medium",
  })

  const [formFields, setFormFields] = useState<FormField[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await fetch("/api/form-fields")
        const data = await response.json()

        if (data.formFields) {
          setFormFields(data.formFields)

          // Initialize form data with empty values for each field
          const initialData: Record<string, any> = { priority: "Medium" }
          data.formFields.forEach((field: FormField) => {
            initialData[field.id] = field.type === "checkbox" ? [] : ""
          })
          setFormData(initialData)
        }
      } catch (error) {
        console.error("[v0] Error fetching form fields:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormFields()
  }, [])

  const handleInputChange = (fieldId: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

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

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("[v0] Form submission:", { formData, isDraft })

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isDraft,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)

        // Reset form after successful submission
        if (!isDraft) {
          const resetData: Record<string, any> = { priority: "Medium" }

          // Reset all fields to empty values
          formFields.forEach((field) => {
            resetData[field.id] = field.type === "checkbox" ? [] : ""
          })

          setFormData(resetData)
        }
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error("[v0] Submission error:", error)
      alert("Error submitting ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || (field.type === "checkbox" ? [] : "")

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={4}
            required={field.required}
            className="resize-none"
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(value) => handleInputChange(field.id, value)} required={field.required}>
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
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        )

      case "url":
        return (
          <Input
            id={field.id}
            type="url"
            value={value}
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
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
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
                Back to Dashboard
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
