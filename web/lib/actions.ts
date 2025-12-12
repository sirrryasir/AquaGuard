"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";

export async function submitReport(formData: FormData) {
  const sourceId = formData.get("sourceId");
  const status = formData.get("status") as string;
  const note = formData.get("note") as string;

  // Basic validation
  if (!sourceId || !status) {
    return { success: false, message: "Missing required fields" };
  }

  try {
    await prisma.report.create({
      data: {
        source_id: parseInt(sourceId.toString()),
        status: status,
        note: note || "",
        submitted_by: "web",
      },
    });

    // Also update the source status if it's a critical report?
    // Maybe let admin approve first. But for demo visualization we might want immediate update.
    // Let's stick to "Admin approves" rule from prompt.

    revalidatePath("/admin/reports");
    return { success: true, message: "Report submitted successfully" };
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, message: "Failed to submit report" };
  }
}

export async function approveReport(id: number) {
  try {
    // Update report to approved
    const report = await prisma.report.update({
      where: { id },
      data: { approved: true },
    });

    // Logic to update source status could go here
    // For example, if report says "working", update source to "working"
    if (report.status) {
      await prisma.waterSource.update({
        where: { id: report.source_id },
        data: { status: report.status, last_updated: new Date() },
      });
    }

    revalidatePath("/admin/reports");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function rejectReport(id: number) {
  try {
    await prisma.report.delete({
      where: { id },
    });
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function addSource(formData: FormData) {
  const name = formData.get("name") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);
  const village = formData.get("village") as string;

  try {
    await prisma.waterSource.create({
      data: {
        name,
        lat,
        lng,
        village,
        status: "working",
      },
    });
    revalidatePath("/admin/sources");
    revalidatePath("/water-sources");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function deleteSource(id: number) {
  try {
    await prisma.waterSource.delete({
      where: { id },
    });
    revalidatePath("/admin/sources");
    revalidatePath("/water-sources");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
