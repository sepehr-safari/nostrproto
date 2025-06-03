import { Check, ChevronsUpDown, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppConfig } from "@/components/AppProvider";
import { useState } from "react";

interface RelaySelectorProps {
  className?: string;
}

export function RelaySelector({ className }: RelaySelectorProps) {
  const { config, updateConfig, availableRelays } = useAppConfig();
  const [open, setOpen] = useState(false);

  const selectedOption = availableRelays.find((option) => option.url === config.relayUrl);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="truncate">
              {selectedOption ? selectedOption.name : "Select relay..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search relays..." />
          <CommandList>
            <CommandEmpty>No relay found.</CommandEmpty>
            <CommandGroup>
              {availableRelays.map((option) => (
                <CommandItem
                  key={option.url}
                  value={option.url}
                  onSelect={(currentValue) => {
                    updateConfig("relayUrl", currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      config.relayUrl === option.url ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-xs text-muted-foreground">{option.url}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}