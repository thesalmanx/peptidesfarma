/**
 * Debug logging utility — writes to a `debug_log` table in PostgreSQL.
 * Table is auto-created on first use if it doesn't exist.
 */

let tableChecked = false

async function ensureTable(pg: any) {
  if (tableChecked) return
  try {
    await pg.raw(`
      CREATE TABLE IF NOT EXISTS debug_log (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        event VARCHAR(100) NOT NULL,
        order_id VARCHAR(255),
        level VARCHAR(20) NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        data JSONB,
        duration_ms INTEGER
      )
    `)
    await pg.raw(`CREATE INDEX IF NOT EXISTS idx_debug_log_event ON debug_log(event)`)
    await pg.raw(`CREATE INDEX IF NOT EXISTS idx_debug_log_order_id ON debug_log(order_id)`)
    await pg.raw(`CREATE INDEX IF NOT EXISTS idx_debug_log_created_at ON debug_log(created_at)`)
    tableChecked = true
  } catch {
    // Table likely already exists
    tableChecked = true
  }
}

export async function debugLog(
  pg: any,
  event: string,
  orderId: string | null,
  message: string,
  data?: Record<string, any>,
  options?: { level?: "info" | "warn" | "error"; durationMs?: number }
) {
  try {
    await ensureTable(pg)
    await pg.raw(
      `INSERT INTO debug_log (event, order_id, level, message, data, duration_ms) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event,
        orderId || null,
        options?.level || "info",
        message,
        data ? JSON.stringify(data) : null,
        options?.durationMs || null,
      ]
    )
  } catch {
    // Never let logging break the flow
  }
}

/** Helper to time an async operation and log it */
export async function debugLogTimed<T>(
  pg: any,
  event: string,
  orderId: string | null,
  message: string,
  fn: () => Promise<T>,
  data?: Record<string, any>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const ms = Date.now() - start
    await debugLog(pg, event, orderId, `${message} — OK (${ms}ms)`, data, { durationMs: ms })
    return result
  } catch (err: any) {
    const ms = Date.now() - start
    await debugLog(pg, event, orderId, `${message} — FAILED: ${err.message}`, { ...data, error: err.message }, { level: "error", durationMs: ms })
    throw err
  }
}
