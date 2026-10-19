"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/ui/tabs";
import BlogPosts from "./BlogPosts/BlogPosts";
import BlogCategories from "./BlogCategories/BlogCategories";

const BlogManager = () => {
  return (
    <div>
      <header>
        <h2 className="text-lg font-semibold text-foreground">Blog Manager</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage your blog posts and categories here.
        </p>
      </header>

      <Tabs defaultValue="blog" className="w-full mt-5">
        <TabsList className="w-full max-w-full overflow-x-auto">
          <TabsTrigger value="blog">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="mt-6">
          <BlogPosts />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <BlogCategories />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogManager;
