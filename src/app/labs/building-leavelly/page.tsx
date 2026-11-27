import type { Metadata } from "next";
import PostLayout from "@/components/labs/PostLayout";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Building Leavelly",
  description:
    "A leave planner for individuals and freelancers, from planning docs to a live product in one day.",
};

export default function Page() {
  return (
    <PostLayout slug="building-leavelly">
      <Content />
    </PostLayout>
  );
}
