import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for HR feature
 * Manages employees, departments, leave requests, and attendance
 */

// ============================================================================
// Employee Mutations
// ============================================================================

/**
 * Create a new employee
 */
export const createEmployee = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    designationId: v.optional(v.id("designations")),
    employmentType: v.optional(v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("contract"),
      v.literal("intern"),
      v.literal("probation")
    )),
    joiningDate: v.optional(v.number()),
    salary: v.optional(v.object({
      amount: v.number(),
      currency: v.string(),
      frequency: v.union(
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("annually")
      ),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_MANAGE
    )

    const now = Date.now()

    // Generate employee code
    const existingEmployees = await ctx.db
      .query("employees")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const employeeCode = `EMP-${String(existingEmployees.length + 1).padStart(4, "0")}`

    const employeeId = await ctx.db.insert("employees", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      employeeCode,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      department: args.departmentId,
      designation: args.designationId,
      employmentType: args.employmentType ?? "full_time",
      joiningDate: args.joiningDate ?? now,
      salary: args.salary,
      documents: [],
      status: "active",
      createdAt: now,
      createdBy: membership.userId,
      updatedAt: now,
      updatedBy: membership.userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.employee.create",
      resourceType: "employee",
      resourceId: employeeId,
      metadata: { employeeCode, email: args.email },
    })

    return { employeeId, employeeCode }
  },
})

/**
 * Update employee details
 */
export const updateEmployee = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    designationId: v.optional(v.id("designations")),
    employmentType: v.optional(v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("contract"),
      v.literal("intern"),
      v.literal("probation")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("on_leave"),
      v.literal("terminated"),
      v.literal("resigned")
    )),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_MANAGE
    )

    const employee = await ctx.db.get(args.employeeId)
    if (!employee || employee.workspaceId !== args.workspaceId) {
      throw new Error("Employee not found")
    }

    const updates: any = {
      updatedAt: Date.now(),
      updatedBy: membership.userId,
    }

    if (args.firstName !== undefined) updates.firstName = args.firstName
    if (args.lastName !== undefined) updates.lastName = args.lastName
    if (args.phone !== undefined) updates.phone = args.phone
    if (args.departmentId !== undefined) updates.department = args.departmentId
    if (args.designationId !== undefined) updates.designation = args.designationId
    if (args.employmentType !== undefined) updates.employmentType = args.employmentType
    if (args.status !== undefined) updates.status = args.status

    await ctx.db.patch(args.employeeId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.employee.update",
      resourceType: "employee",
      resourceId: args.employeeId,
      metadata: { employeeCode: employee.employeeCode },
    })

    return { success: true }
  },
})

/**
 * Terminate employee
 */
export const terminateEmployee = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    terminationDate: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_MANAGE
    )

    const employee = await ctx.db.get(args.employeeId)
    if (!employee || employee.workspaceId !== args.workspaceId) {
      throw new Error("Employee not found")
    }

    await ctx.db.patch(args.employeeId, {
      status: "terminated",
      terminationDate: args.terminationDate,
      updatedAt: Date.now(),
      updatedBy: membership.userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.employee.terminate",
      resourceType: "employee",
      resourceId: args.employeeId,
      metadata: { reason: args.reason, terminationDate: args.terminationDate },
    })

    return { success: true }
  },
})

// ============================================================================
// Department Mutations
// ============================================================================

/**
 * Create a department
 */
export const createDepartment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("departments")),
    managerId: v.optional(v.id("employees")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_MANAGE
    )

    const now = Date.now()

    const departmentId = await ctx.db.insert("departments", {
      workspaceId: args.workspaceId,
      name: args.name,
      code: args.code,
      description: args.description,
      parentDepartment: args.parentId,
      head: args.managerId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.department.create",
      resourceType: "department",
      resourceId: departmentId,
      metadata: { name: args.name, code: args.code },
    })

    return { departmentId }
  },
})

// ============================================================================
// Leave Request Mutations
// ============================================================================

/**
 * Submit a leave request
 */
export const submitLeaveRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    leaveType: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    reason: v.string(),
    isHalfDay: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_VIEW // Employees can submit their own leave
    )

    const employee = await ctx.db.get(args.employeeId)
    if (!employee || employee.workspaceId !== args.workspaceId) {
      throw new Error("Employee not found")
    }

    const now = Date.now()

    // Calculate days
    const msPerDay = 24 * 60 * 60 * 1000
    const days = args.isHalfDay ? 0.5 : Math.ceil((args.endDate - args.startDate) / msPerDay) + 1

    const leaveId = await ctx.db.insert("leaveRequests", {
      workspaceId: args.workspaceId,
      employeeId: args.employeeId,
      leaveTypeId: args.leaveType as Id<"leaveTypes">,
      startDate: args.startDate,
      endDate: args.endDate,
      isHalfDay: args.isHalfDay ?? false,
      totalDays: days,
      reason: args.reason,
      documents: [],
      status: "pending",
      approvalChain: [],
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.leave.submit",
      resourceType: "leaveRequest",
      resourceId: leaveId,
      metadata: { employeeId: args.employeeId, days, leaveType: args.leaveType },
    })

    return { leaveId }
  },
})

/**
 * Approve or reject a leave request
 */
export const processLeaveRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    leaveId: v.id("leaveRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_MANAGE
    )

    const leave = await ctx.db.get(args.leaveId)
    if (!leave || leave.workspaceId !== args.workspaceId) {
      throw new Error("Leave request not found")
    }

    if (leave.status !== "pending") {
      throw new Error("Leave request already processed")
    }

    const now = Date.now()
    const newStatus = args.action === "approve" ? "approved" : "rejected"

    const approvalEntry = {
      approverId: membership.userId,
      status: args.action,
      comments: args.comments,
      actionAt: now,
    }

    await ctx.db.patch(args.leaveId, {
      status: newStatus,
      approvalChain: [...(leave.approvalChain || []), approvalEntry],
      updatedAt: now,
    })

    // If approved, update employee status if leave starts today
    if (args.action === "approve" && leave.startDate <= now) {
      await ctx.db.patch(leave.employeeId, {
        status: "on_leave",
        updatedAt: now,
        updatedBy: membership.userId,
      })
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: `hr.leave.${args.action}`,
      resourceType: "leaveRequest",
      resourceId: args.leaveId,
      metadata: { newStatus, comments: args.comments },
    })

    return { success: true, status: newStatus }
  },
})

// ============================================================================
// Attendance Mutations
// ============================================================================

/**
 * Record attendance check-in
 */
export const checkIn = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_VIEW
    )

    const employee = await ctx.db.get(args.employeeId)
    if (!employee || employee.workspaceId !== args.workspaceId) {
      throw new Error("Employee not found")
    }

    const now = Date.now()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()

    // Check for existing attendance today
    const existingAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee", (q) => 
        q.eq("employeeId", args.employeeId).eq("date", todayStart)
      )
      .first()

    if (existingAttendance) {
      throw new Error("Already checked in today")
    }

    const attendanceId = await ctx.db.insert("attendance", {
      workspaceId: args.workspaceId,
      employeeId: args.employeeId,
      date: todayStart,
      clockIn: now,
      clockInLocation: args.location,
      status: "present",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.attendance.checkin",
      resourceType: "attendance",
      resourceId: attendanceId,
      metadata: { employeeId: args.employeeId },
    })

    return { attendanceId }
  },
})

/**
 * Record attendance check-out
 */
export const checkOut = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    employeeId: v.id("employees"),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.HR_VIEW
    )

    const now = Date.now()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee", (q) => 
        q.eq("employeeId", args.employeeId).eq("date", todayStart)
      )
      .first()

    if (!attendance) {
      throw new Error("No check-in found for today")
    }

    if (attendance.clockOut) {
      throw new Error("Already checked out")
    }

    // Calculate work hours
    const workHours = (now - attendance.clockIn!) / (1000 * 60 * 60)

    await ctx.db.patch(attendance._id, {
      clockOut: now,
      clockOutLocation: args.location,
      workHours,
      notes: args.notes ? `${attendance.notes || ""}\n${args.notes}` : attendance.notes,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "hr.attendance.checkout",
      resourceType: "attendance",
      resourceId: attendance._id,
      metadata: { employeeId: args.employeeId, workHours },
    })

    return { success: true, workHours }
  },
})
