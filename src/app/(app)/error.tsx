"use client";

import { ErrorScreen } from "@/components/ErrorScreen";

// Catches page failures inside the app shell, so the sidebar stays available.
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} />;
}
