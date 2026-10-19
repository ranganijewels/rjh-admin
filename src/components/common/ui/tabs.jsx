// "use client";

// import React, { useState, createContext, useContext } from "react";
// import { cn } from "@/lib/utils";

// // Create a context to share active tab state
// const TabsContext = createContext();

// function Tabs({ defaultValue, children, className }) {
//   const [activeTab, setActiveTab] = useState(defaultValue);

//   return (
//     <TabsContext.Provider value={{ activeTab, setActiveTab }}>
//       <div className={cn("flex flex-col gap-2", className)}>{children}</div>
//     </TabsContext.Provider>
//   );
// }

// function TabsList({ children, className }) {
//   return (
//     <div
//       className={cn(
//         "bg-muted text-muted-foreground h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// }

// function TabsTrigger({ value, children, className }) {
//   const { activeTab, setActiveTab } = useContext(TabsContext);
//   const isActive = activeTab === value;

//   return (
//     <button
//       onClick={() => setActiveTab(value)}
//       className={cn(
//         "text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
//         isActive
//           ? "bg-card  dark:border-input dark:text-foreground"
//           : "",
//         className
//       )}
//     >
//       {children}
//     </button>
//   );
// }

// function TabsContent({ value, children, className }) {
//   const { activeTab } = useContext(TabsContext);
//   const isActive = activeTab === value;

//   return (
//     <div
//       className={cn(
//         "flex-1 outline-none",
//         isActive ? "block" : "hidden",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// }

// export { Tabs, TabsList, TabsTrigger, TabsContent };



//With bg-primary

"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// Create a context to share active tab state
const TabsContext = createContext();

function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("flex flex-col gap-2", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        "bg-muted/70 text-muted-foreground h-10 max-w-full w-fit items-center justify-center gap-1 rounded-xl border border-border p-1 flex overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, children, className }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isActive
          ? "bg-card text-foreground shadow-sm border-border"
          : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }) {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  // Only the active panel is mounted. Every panel is a live data source
  // (lists that fetch on mount), so eagerly mounting all of them fired every
  // tab's API call on page load — including endpoints that 401, which the API
  // client treats as an expired session and bounces the admin to /login.
  return (
    <div
      className={cn(
        "flex-1 outline-none",
        isActive ? "block" : "hidden",
        className
      )}
    >
      {isActive ? children : null}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
