import { useEffect, useMemo, useState } from "react";

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
}

function build(total: number): CountdownValue {
  const safe = Math.max(0, total);
  return {
    days: Math.floor(safe / 86400000),
    hours: Math.floor((safe / 3600000) % 24),
    minutes: Math.floor((safe / 60000) % 60),
    seconds: Math.floor((safe / 1000) % 60),
    total: safe,
    expired: total <= 0
  };
}

export function useCountdown(targetIso: string | null, serverTime: string | null) {
  const [now, setNow] = useState(() => Date.now());
  const offset = useMemo(() => {
    if (!serverTime) return 0;
    const parsed = new Date(serverTime).getTime();
    return Number.isFinite(parsed) ? parsed - Date.now() : 0;
  }, [serverTime]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    if (!targetIso) return build(0);
    const target = new Date(targetIso).getTime();
    if (!Number.isFinite(target)) return build(0);
    return build(target - (now + offset));
  }, [targetIso, now, offset]);
}
