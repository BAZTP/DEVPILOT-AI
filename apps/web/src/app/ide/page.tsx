import type { Metadata } from "next";
import { IDELayout } from "@/components/layout/IDELayout";

export const metadata: Metadata = {
  title: "IDE",
  description: "Entorno de desarrollo integrado DevPilot AI con asistencia de IA y Monaco Editor",
};

export default function IDEPage() {
  return <IDELayout />;
}
