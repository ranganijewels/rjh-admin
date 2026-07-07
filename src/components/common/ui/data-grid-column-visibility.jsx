import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function DataGridColumnVisibility({ table, trigger }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[180px]">
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
              {column.columnDef.meta?.headerTitle ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DataGridColumnVisibility };
