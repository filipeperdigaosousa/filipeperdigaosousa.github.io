import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import BusinessDaysClient from "./BusinessDaysClient";
import { tools } from "@/data/tools";

const tool = tools.find((t) => t.slug === "business-days")!;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.summary,
};

export default function Page() {
  return (
    <ToolShell
      slug={tool.slug}
      name={tool.name}
      summary={tool.summary}
      icon={tool.icon}
      tags={tool.tags}
    >
      <BusinessDaysClient />
    </ToolShell>
  );
}
