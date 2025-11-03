// @ts-nocheck - Bypass type checking due to Convex generated API type instantiation depth limits
import { cronJobs } from "convex/server"
import { internal } from "../../_generated/api"

const crons = cronJobs()

crons.interval(
  "process scheduled cms actions",
  { minutes: 1 },
  internal.features.cms.actions.processScheduledActions
)

export default crons
