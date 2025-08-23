import { NextResponse } from "next/server"
import { googleSheetsService } from "@/lib/google-sheets"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ message: "Missing ticket ID or status" }, { status: 400 })
    }

    const success = await googleSheetsService.updateTicketStatus(id, status)

    if (success) {
      return NextResponse.json({ message: "Ticket status updated successfully" })
    } else {
      return NextResponse.json({ message: "Failed to update ticket status" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
