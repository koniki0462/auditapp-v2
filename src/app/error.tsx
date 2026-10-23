"use client";

import { ErrorScreen } from "@/components/ErrorScreen";

// Catches failures in the (app) layout itself, such as the API being down when loading the session.
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} />;
}
