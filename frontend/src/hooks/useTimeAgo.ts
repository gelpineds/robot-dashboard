import { useState, useEffect } from "react";

/**
 * Custom hook that returns a real-time "time ago" string
 * Updates every second to reflect current time difference
 * @param timestamp ISO string timestamp
 * @returns Real-time "time ago" string (e.g., "2 mins ago", "1 hr ago")
 */
export function useTimeAgo(timestamp: string | undefined): string {
  const [timeAgo, setTimeAgo] = useState(() => calculateTimeAgo(timestamp));

  useEffect(() => {
    if (!timestamp) return;

    // Update immediately
    setTimeAgo(calculateTimeAgo(timestamp));

    // Update every minute for real-time display
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo(timestamp));
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}

/**
 * Calculate "time ago" string from a timestamp
 * Properly handles UTC timestamps for real-time accuracy
 * @param ts ISO string timestamp
 * @returns "time ago" string
 */
export function calculateTimeAgo(ts: string | undefined): string {
  if (!ts) return "—";
  
  try {
    // Parse timestamp ensuring proper UTC handling
    const date = new Date(ts.includes('Z') || ts.includes('+') || ts.includes('-') ? ts : ts + 'Z');
    if (isNaN(date.getTime())) return "—";
    
    const now = Date.now();
    const diffMs = now - date.getTime();
    const secs = Math.floor(diffMs / 1000);
    
    // Handle timestamps in the future (shouldn't happen but be safe)
    if (secs < 0) return "just now";
    if (secs < 1) return "just now";
    if (secs < 60) return `${secs} sec${secs !== 1 ? "s" : ""} ago`;
    
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
    
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
    
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  } catch {
    return "—";
  }
}

/**
 * Format timestamp to locale string (static, doesn't update)
 * Properly handles UTC timestamps
 * @param ts ISO string timestamp
 * @returns Formatted date string
 */
export function formatTimestampStatic(ts: string | undefined): string {
  if (!ts) return "—";
  
  try {
    // Parse timestamp ensuring proper UTC handling
    const date = new Date(ts.includes('Z') || ts.includes('+') || ts.includes('-') ? ts : ts + 'Z');
    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return ts || "—";
  }
}

/**
 * Format timestamp to date-only string
 * Properly handles UTC timestamps
 * @param ts ISO string timestamp
 * @returns Formatted date string (e.g., "May 6")
 */
export function formatDateOnly(ts: string | undefined): string {
  if (!ts) return "—";
  
  try {
    // Parse timestamp ensuring proper UTC handling
    const date = new Date(ts.includes('Z') || ts.includes('+') || ts.includes('-') ? ts : ts + 'Z');
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return ts || "—";
  }
}

/**
 * Format timestamp to time-only string
 * Properly handles UTC timestamps
 * @param ts ISO string timestamp
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTimeOnly(ts: string | undefined): string {
  if (!ts) return "—";
  
  try {
    // Parse timestamp ensuring proper UTC handling
    const date = new Date(ts.includes('Z') || ts.includes('+') || ts.includes('-') ? ts : ts + 'Z');
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return ts || "—";
  }
}
