import { Command, CommandInput } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function ManagementSearch({
  value,
  onValueChange,
  placeholder,
  label,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  label: string
  className?: string
}) {
  return (
    <Command
      shouldFilter={false}
      className={cn(
        "h-8! min-w-52 flex-1 rounded-lg! bg-transparent p-0!",
        className
      )}
    >
      <CommandInput
        compact
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        aria-label={label}
      />
    </Command>
  )
}
