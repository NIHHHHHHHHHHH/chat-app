
"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  // value = current search text
  value: string;
  // onChange = function called when user types
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    // relative = needed for absolute positioning of icons
    <div className="relative">

      {/* Search icon on the left */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      {/* Input field */}
      <Input
        placeholder="Search users..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />

      {/* Clear button - only shows when there is text */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}