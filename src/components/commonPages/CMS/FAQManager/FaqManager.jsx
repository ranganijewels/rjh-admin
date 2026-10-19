import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/ui/tabs";
import React from "react";
import FAQs from "./FAQs/FAQs";
import FAQCategories from "./FAQCategories/FAQCategories";

const FaqManager = () => {
  return (
    <div>
      <header>
        <h2 className="text-lg font-semibold text-foreground">FAQ Manager</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage your FAQ entries here.
        </p>
      </header>

      <Tabs defaultValue="faq" className="w-full mt-5">
        <TabsList className="w-full max-w-full overflow-x-auto">
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <FAQs />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <FAQCategories />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FaqManager;
