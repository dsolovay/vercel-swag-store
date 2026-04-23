import Link from "next/link";

export default function NotFound() {
  return (
    <div className="my-6 px-6">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-gray-600 mt-2">Sorry, that&apos;s a 404. Check out our swag <Link className="text-blue-500 underline" href="/search">here</Link>.</p>
    </div>
  );
}