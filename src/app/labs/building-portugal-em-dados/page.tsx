import type { Metadata } from "next";
import PostLayout from "@/components/labs/PostLayout";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Building Portugal em Dados",
  description:
    "A side project that turns official Portuguese statistics into an answer, a chart and a source, and how AI let one person ship it in 10 days.",
};

export default function Page() {
  return (
    <PostLayout slug="building-portugal-em-dados">
      <Content />
    </PostLayout>
  );
}
