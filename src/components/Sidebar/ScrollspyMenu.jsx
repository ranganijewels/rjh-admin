"use client";

import { cn } from "@/lib/utils";

const ScrollspyMenu = ({ items, onClick, activeItem }) => {
  const buildAnchor = (item, index, indent = false) => {
    const isActive = item.target === activeItem;
    return (
      <button
        type="button"
        key={index}
        data-scrollspy-anchor={item.target}
        data-active={isActive}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.title}
        className={cn(
          "cursor-pointer flex items-center w-full text-start rounded-lg ps-2.5 pe-2.5 py-1.5 border border-transparent text-accent-foreground hover:text-primary data-[active=true]:bg-accent data-[active=true]:text-primary data-[active=true]:font-medium",
          indent ? "gap-3.5" : "gap-1.5"
        )}
        onClick={() => onClick?.(item.target)}
      >
        <span
          className={cn(
            "flex w-1.5 relative before:absolute start-px rtl:-start-[5px] before:top-0 before:size-1.5 before:rounded-full before:-translate-x-2/4 before:-translate-y-2/4 before:bg-muted data-[active=true]:before:bg-primary",
            isActive && "text-primary"
          )}
        ></span>
        {item.title}
      </button>
    );
  };

  return (
    <div className="flex flex-col grow relative before:absolute before:start-[11px] before:top-0 before:bottom-0 before:border-s before:border-border text-sm">
      {items.map((item, index) => buildAnchor(item, index))}
    </div>
  );
};

export { ScrollspyMenu };
