"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "pf_site_auth"

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved === "true") {
      setAuthenticated(true)
    }
    setChecking(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)

    const res = await fetch("/api/auth/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      sessionStorage.setItem(STORAGE_KEY, "true")
      setAuthenticated(true)
    } else {
      setError(true)
      setPassword("")
    }
  }

  if (checking) return null

  if (authenticated) return <>{children}</>

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #f7f8fa 0%, #c8d5e5 100%)",
      padding: 20,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "48px 40px",
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        <img src="/peptidesfarma-logo-dark.svg" alt="PeptidesFarma" style={{ height: 36, marginBottom: 32 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--pf-ink)", margin: "0 0 8px" }}>
          Password Required
        </h1>
        <p style={{ fontSize: 14, color: "var(--pf-text-3)", margin: "0 0 28px" }}>
          This site is currently in preview mode.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              border: error ? "2px solid var(--pf-err)" : "1px solid var(--pf-line)",
              borderRadius: 12,
              fontSize: 16,
              fontFamily: "inherit",
              color: "var(--pf-ink)",
              outline: "none",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ fontSize: 13, color: "var(--pf-err)", margin: "0 0 12px" }}>Incorrect password. Please try again.</p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              height: 48,
              borderRadius: 999,
              background: "var(--pf-blue)",
              color: "#fff",
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Enter Site
          </button>
        </form>
      </div>
    </div>
  )
}
