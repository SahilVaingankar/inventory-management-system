import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useStore } from "../stores/store.ts";

const Searchbar = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { filteredProducts, setProducts, filterSuggestions } = useStore();

  useEffect(() => {
    filterSuggestions(searchQuery);
  }, [searchQuery]);

  return (
    <div className="w-full rounded-lg border mx-2 flex justify-between relative">
      <input
        className="w-full mx-2 outline-none placeholder:text-gray-500"
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <span className="m-2">
        <FaSearch />
      </span>
    </div>
  );
};

export default Searchbar;
