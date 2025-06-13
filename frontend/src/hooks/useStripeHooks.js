import { useState, useEffect } from "react"

export const useStripeWebhook = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)

  // Method 1: Polling approach
  const pollWebhookEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/webhook-events")
      const events = await response.json()

      // Process events
      events.forEach((event) => {
        handleWebhookEvent(event.type, event.data)
      })
    } catch (error) {
      console.error("Error polling webhook events:", error)
    } finally {
      setLoading(false)
    }
  }

  // Method 2: Server-Sent Events approach
  const setupSSE = () => {
    const eventSource = new EventSource("/api/webhook-stream")

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebhookEvent(data.type, data.payload)
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
    }

    return () => eventSource.close()
  }

  const handleWebhookEvent = (eventType, data) => {
    switch (eventType) {
      case "subscription-created":
      case "subscription-updated":
        setSubscriptions((prev) => {
          const index = prev.findIndex((sub) => sub.id === data.id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = data
            return updated
          }
          return [...prev, data]
        })
        break

      case "subscription-deleted":
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== data.id))
        break

      case "payment-succeeded":
      case "payment-failed":
      case "payment-intent-succeeded":
      case "payment-intent-failed":
        setPayments((prev) => [...prev, data])
        break

      default:
        console.log("Unhandled webhook event:", eventType, data)
    }
  }

  useEffect(() => {
    // Choose your preferred method:

    // Option 1: Polling every 30 seconds
    const interval = setInterval(pollWebhookEvents, 30000)
    pollWebhookEvents() // Initial call

    // Option 2: Server-Sent Events
    // const cleanup = setupSSE();

    return () => {
      clearInterval(interval)
      // cleanup?.();
    }
  }, [])

  return {
    subscriptions,
    payments,
    loading,
    refetch: pollWebhookEvents,
  }
}
