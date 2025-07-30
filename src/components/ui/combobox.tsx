
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
                {createLabel && inputValue && (
                    <div className="p-1">
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
