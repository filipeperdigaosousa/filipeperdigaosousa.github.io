import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mt-12 mb-6 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-mono text-headline-md text-primary mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-mono text-body-lg text-on-surface font-bold mt-8 mb-3 uppercase tracking-widest">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-body-md md:text-body-lg text-on-surface/85 leading-relaxed mb-5">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-primary underline underline-offset-4 hover:text-secondary transition-colors"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 space-y-2 text-body-md text-on-surface/85">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-2 text-body-md text-on-surface/85">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
      <strong className="text-primary font-semibold">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="text-secondary not-italic">{children}</em>
    ),
    code: ({ children }) => (
      <code className="font-mono text-code-sm bg-surface-container-high px-1.5 py-0.5 rounded text-primary">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="glass-card rounded-lg p-5 mb-6 overflow-x-auto font-mono text-code-sm leading-relaxed">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-secondary/40 pl-4 my-6 italic text-on-surface-variant">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-white/5 my-10" />,
    ...components,
  };
}
