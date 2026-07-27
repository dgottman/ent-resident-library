import { SearchIcon } from "@/components/icons";

export function SearchForm() {
  return (
    <form className="hero-search" action="/guides" role="search">
      <SearchIcon />
      <label className="sr-only" htmlFor="site-search">
        Search the study guide library
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search free flaps, vestibular testing, Volume IV…"
        autoComplete="off"
      />
      <button type="submit">Search library</button>
    </form>
  );
}
