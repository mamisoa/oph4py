import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Worklist Management",
  description: "Manage patient worklist entries and users",
};

export default function WorklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 