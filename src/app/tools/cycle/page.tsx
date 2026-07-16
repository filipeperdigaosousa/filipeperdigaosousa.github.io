import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import CycleClient from "./CycleClient";
import { tools } from "@/data/tools";

const tool = tools.find((t) => t.slug === "cycle")!;

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
      <CycleClient />
    </ToolShell>
  );
}
