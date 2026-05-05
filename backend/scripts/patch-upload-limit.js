const fs = require("fs")
const path = require("path")

try {
  const roots = [path.join(__dirname, ".."), process.cwd()]
  const OLD = /1024\s*\*\s*1024/g
  const NEW = "50 * 1024 * 1024"
  let patched = 0

  for (const root of roots) {
    for (const file of ["chunk-BYOPZAGX.mjs", "app.js"]) {
      const fp = path.join(root, "node_modules/@medusajs/dashboard/dist", file)
      if (!fs.existsSync(fp)) continue
      let c = fs.readFileSync(fp, "utf-8")
      const before = c
      c = c.replace(OLD, NEW).replace(/size:\s*"1MB"/g, 'size: "50MB"')
      if (c !== before) {
        fs.writeFileSync(fp, c)
        patched++
      }
    }
  }
} catch (e) {
  // Patch skipped
}
