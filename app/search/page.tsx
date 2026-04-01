import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for your favorite Vercel swag items.",
  openGraph: {
    title: "Search",
    description: "Search for your favorite Vercel swag items.",
  },
};
export default function Search() {
  return (
    <div>
      <h1>Search Page</h1>
      <p>This is the search page.</p>
    </div>
  );
}
