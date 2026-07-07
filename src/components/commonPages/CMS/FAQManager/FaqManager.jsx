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
    <div className="min-h-screen">
      <header>
        <h1 className="font-semibold">FAQ Manager</h1>
        <p className="text-muted-foreground">
          Create and manage your FAQ entries here.
        </p>
      </header>

      <Tabs defaultValue="faq" className="w-full mt-6">
        <TabsList className="grid grid-cols-2">
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
