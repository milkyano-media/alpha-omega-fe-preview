import { ConditionalLayout } from "@/components/conditional-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ConditionalLayout>{children}</ConditionalLayout>;
}
