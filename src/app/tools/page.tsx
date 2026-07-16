import type { Metadata } from "next";
import ToolsClient from "./ToolsClient";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Static in-browser helpers — some drawn from my own workflow, others just useful. Everything runs locally.",
};

export default function ToolsPage() {
  return <ToolsClient />;
}
