import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CAPE_TOWN_SUBURBS } from "@/lib/cape-town-suburbs";

type Props = {
  value?: string;
  onChange: (v: string) => void;
  className?: string;
};

export function LocationPicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? CAPE_TOWN_SUBURBS.filter((s) => s.toLowerCase().includes(q))
      : CAPE_TOWN_SUBURBS;
    return list.slice(0, 40);
  }, [query]);

  const showCreate =
    query.trim().length > 1 &&
    !CAPE_TOWN_SUBURBS.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background/70 px-3 text-sm shadow-sm backdrop-blur transition hover:border-primary/60 hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring",
            className,
          )}
        >
          <MapPin className="size-3.5 text-primary" />
          <span className={cn("max-w-[180px] truncate", !value && "text-muted-foreground")}>
            {value || "Choose your suburb"}
          </span>
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Cape Town suburbs…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No suburb found.</CommandEmpty>
            <CommandGroup>
              {options.map((s) => (
                <CommandItem
                  key={s}
                  value={s}
                  onSelect={() => {
                    onChange(s);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value?.toLowerCase() === s.toLowerCase() ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {s}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem
                  value={query}
                  onSelect={() => {
                    onChange(query.trim());
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <MapPin className="mr-2 size-4 text-accent" />
                  Use "{query.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
