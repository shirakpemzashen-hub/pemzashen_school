"use client";

import { useState } from "react";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // Hard navigation ensures the new cookie is included in the next request.
        // router.push() can serve a cached (pre-cookie) render of /admin.
        window.location.href = "/admin";
      } else {
        setError("Սխալ գաղտնի կոդ։ Կրկին փորձեք։");
      }
    } catch {
      setError("Կապի սխալ։ Ստուգեք ինտերնետ կապը։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-logo">Փ</div>
        <h1>Ադմին մուտք</h1>
        <p>Մուտքագրեք ադմինի գաղտնի կոդը՝ կայքի կառավարման վահանակ մտնելու համար</p>

        <label>
          Գաղտնի կոդ
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="••••••••••••"
            autoFocus
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="login-error">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Ստուգում..." : "Մուտք գործել"}
        </button>
      </form>
    </main>
  );
}
