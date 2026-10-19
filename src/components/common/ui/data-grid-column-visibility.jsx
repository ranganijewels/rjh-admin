import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function humanizeColumnId(id = "") {
  return String(id)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function columnLabel(column) {
  return column.columnDef.meta?.headerTitle || humanizeColumnId(column.id);
}

function DataGridColumnVisibility({ table, trigger }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="font-medium">
          Toggle Columns
        </DropdownMenuLabel>

        {table
          .getAllLeafColumns() // ✅ leaf columns only
          .filter((column) => column.getCanHide()) // ✅ only hideable ones
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              // Radix passes true | false | "indeterminate"
              onCheckedChange={(v) => column.toggleVisibility(v === true)}
            >
              {columnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            table.resetColumnVisibility();
          }}
          className="justify-center text-xs font-medium"
        >
          Reset columns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DataGridColumnVisibility };
