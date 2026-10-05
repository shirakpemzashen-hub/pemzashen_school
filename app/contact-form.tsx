"use client";

import { useState } from "react";

interface Props {
  labels: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    sent: string;
  };
  recipientEmail: string;
}

export function ContactForm({ labels, recipientEmail }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");

    const subject = encodeURIComponent(
      name ? `Հաղորդագրություն — ${name}` : "Հաղորդագրություն կայքից"
    );
    const body = encodeURIComponent(
      [
        name ? `Անուն: ${name}` : "",
        email ? `Էլ. փոստ: ${email}` : "",
        "",
        message,
      ]
        .filter((line, i) => i > 1 || line)
        .join("\n")
    );

    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    // Optimistically mark as sent after a short delay
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setStatus("sent");
    }, 600);
  }

  if (status === "sent") {
    return <p className="contact-sent">{labels.sent}</p>;
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label>
        {labels.name}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePlaceholder}
          autoComplete="name"
        />
      </label>

      <label>
        {labels.email}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder}
          autoComplete="email"
        />
      </label>

      <label>
        {labels.message}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={labels.messagePlaceholder}
          required
        />
      </label>

      <button type="submit" disabled={status === "sending" || !message.trim()}>
        {status === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}
