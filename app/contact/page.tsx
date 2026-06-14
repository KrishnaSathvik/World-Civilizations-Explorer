import type { Metadata } from "next";
import ContactPage from "@/views/ContactPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with the World Civilizations Explorer team — feedback, corrections, partnership and source-attribution questions welcome.",
  path: "/contact",
});

export default function ContactRoute() {
  return <ContactPage />;
}
