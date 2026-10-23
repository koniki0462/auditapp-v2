import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}
