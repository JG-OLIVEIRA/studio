
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Function to calculate Levenshtein distance
const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
};


interface ComboboxProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    createLabel?: string;
    disabled?: boolean;
}

export function Combobox({ options, value, onChange, placeholder, createLabel, disabled = false }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  
  const handleSelect = (currentValue: string) => {
    onChange(currentValue.toLowerCase() === value.toLowerCase() ? "" : currentValue)
    setOpen(false)
  }

  const handleCreate = () => {
    if (inputValue) {
        onChange(inputValue)
        setOpen(false)
    }
  }

  // Find the label matching the current value, case-insensitively.
  const currentLabel = options.find((option) => option.value.toLowerCase() === value.toLowerCase())?.label || value;

  // Find suggestion for "Did you mean?"
  const suggestion = React.useMemo(() => {
    if (!inputValue || options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase())) {
        return null;
    }
    let bestMatch: string | null = null;
    let minDistance = 3; // Threshold for suggestion

    for (const option of options) {
        const distance = levenshteinDistance(inputValue.toLowerCase(), option.label.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = option.label;
        }
    }
    return bestMatch;
  }, [inputValue, options]);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {value ? currentLabel : placeholder || "Select option..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder || "Search..."}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                <div className='p-1 text-sm text-center'>
                    {suggestion ? (
                         <button
                            type="button"
                            className="text-left w-full p-2 hover:bg-accent rounded-md"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(suggestion);
                                setOpen(false);
                            }}
                        >
                           Você quis dizer: <span className="font-semibold">{suggestion}</span>?
                        </button>
                    ) : (
                         <p className="text-muted-foreground p-2">Nenhum resultado.</p>
                    )}
                     {createLabel && inputValue && (
                        <div className="p-1 mt-2 border-t">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleCreate();
                                }}
                            >
                                {createLabel} "{inputValue}"
                            </Button>
                        </div>
                    )}
                </div>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
