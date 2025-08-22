import { type NextRequest, NextResponse } from "next/server"
import { googleSheetsService } from "@/lib/google-sheets"

export async function GET() {
  try {
    const formFields = await googleSheetsService.getFormFields()
    return NextResponse.json({ success: true, formFields })
  } catch (error) {
    console.error("[v0] Error fetching form fields:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch form fields",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { formFields } = await request.json()
    const success = await googleSheetsService.appendFormFields(formFields)

    if (success) {
      return NextResponse.json({ success: true, message: "Form fields updated successfully" })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update form fields",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Error updating form fields:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
