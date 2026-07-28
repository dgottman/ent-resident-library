"use client";

import { useMemo, useState } from "react";
import { GuideCard } from "@/components/guide-card";
import { SearchIcon } from "@/components/icons";
import {
  compareGuidesBySeries,
  matchesGuideSearch,
} from "@/lib/guide-utils";
import type { Guide } from "@/lib/types";

type SortOption = "title" | "updated" | "category" | "series";

export function GuideExplorer({
  guides,
  initialQuery = "",
}: {
  guides: Guide[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [collection, setCollection] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortOption>("title");

  const categories = useMemo(
    () => [...new Set(guides.map((guide) => guide.category))].sort(),
    [guides],
  );
  const collections = useMemo(
    () => [...new Set(guides.map((guide) => guide.collection))].sort(),
    [guides],
  );
  const tags = useMemo(
    () => [...new Set(guides.flatMap((guide) => guide.tags))].sort(),
    [guides],
  );

  const results = useMemo(() => {
    const filtered = guides.filter(
      (guide) =>
        matchesGuideSearch(guide, query) &&
        (!category || guide.category === category) &&
        (!collection || guide.collection === collection) &&
        (!tag || guide.tags.includes(tag)),
    );
    return filtered.sort((a, b) => {
      if (sort === "updated") {
        return (
          Date.parse(b.lastReviewedDate ?? b.fileModifiedDate) -
          Date.parse(a.lastReviewedDate ?? a.fileModifiedDate)
        );
      }
      if (sort === "category") {
        return (
          a.category.localeCompare(b.category) ||
          a.displayTitle.localeCompare(b.displayTitle, undefined, {
            numeric: true,
          })
        );
      }
      if (sort === "series") {
        return (
          a.collection.localeCompare(b.collection) ||
          compareGuidesBySeries(a, b)
        );
      }
      return a.displayTitle.localeCompare(b.displayTitle, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [guides, query, category, collection, tag, sort]);

  const hasFilters = Boolean(query || category || collection || tag);

  function reset() {
    setQuery("");
    setCategory("");
    setCollection("");
    setTag("");
  }

  return (
    <div className="guide-explorer">
      <div className="explorer-controls">
        <div className="directory-search">
          <SearchIcon />
          <label className="sr-only" htmlFor="directory-query">
            Search guides
          </label>
          <input
            id="directory-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, topic, tag, author, or volume"
          />
        </div>
        <div className="filter-row">
          <FilterSelect
            id="category-filter"
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories}
          />
          <FilterSelect
            id="collection-filter"
            label="Collection"
            value={collection}
            onChange={setCollection}
            options={collections}
          />
          <FilterSelect
            id="tag-filter"
            label="Tag"
            value={tag}
            onChange={setTag}
            options={tags}
          />
          <label className="filter-field" htmlFor="sort-guides">
            <span>Sort</span>
            <select
              id="sort-guides"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
            >
              <option value="title">Title A–Z</option>
              <option value="updated">Last updated</option>
              <option value="category">Category</option>
              <option value="series">Collection & volume</option>
            </select>
          </label>
        </div>
      </div>

      <div className="results-summary" aria-live="polite">
        <p>
          <strong>{results.length}</strong>{" "}
          {results.length === 1 ? "guide" : "guides"}
          {hasFilters ? " match your search" : " in the library"}
        </p>
        {hasFilters && (
          <button type="button" className="text-button" onClick={reset}>
            Clear all filters
          </button>
        )}
      </div>

      {results.length ? (
        <div className="guide-grid">
          {results.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No guides found</h2>
          <p>Try a broader term or clear one of the filters.</p>
          <button type="button" className="button button-secondary" onClick={reset}>
            Reset directory
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter-field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">
          All {label === "Category" ? "categories" : `${label.toLowerCase()}s`}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
