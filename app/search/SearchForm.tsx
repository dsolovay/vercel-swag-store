"use client";
import { useRouter, useSearchParams } from "next/navigation";

const Categories = [
  "bottles",
  "cups",
  "mugs",
  "desk",
  "stationery",
  "accessories",
  "bags",
  "hats",
  "t-shirts",
  "hoodies",
  "socks",
  "tech",
  "books",
] as const;

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateUrl({  q, category}: {q?: string, category?: string}) {

    // Rewrite using pattern from lesson.
    const newParams = new URLSearchParams(searchParams.toString());
    if (q !== undefined) {
      newParams.set("q", q);
    }
    if (category !== undefined) {
      newParams.set("category", category);
    }
    newParams.set("page", "1");
    router.push(
      `/search?${newParams.toString()}`,
    );
  }

  function onTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length >= 3 || value.length === 0) {
      updateUrl({q: value});
    }
  }

  function categoryOnChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    updateUrl({category: value});
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("search")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    updateUrl({q, category});
  }

  return (
    <form className="px-4 py-4" onSubmit={onSubmit}>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Categories
      </label>
      <select 
        title="category select" 
        name="category" 
        onChange={categoryOnChange}
        className="border rounded px-2 py-1 w-full mt-2"
        defaultValue={searchParams.get("category") ?? ""}
        >
      
        <option value="">All Categories</option>
        {Categories.map((category) => (
          <option key={category} title={category}>
            {category}
          </option>
        ))}
      </select>
      <div>
        <input
          name="search"
          onChange={onTextChange}
          className="border rounded px-2 py-1 w-full my-4"
          type="text"
          placeholder="Search for products..."
          defaultValue={searchParams.get("q") ?? ""}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Search
      </button>
    </form>
  );
}
