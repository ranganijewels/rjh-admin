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
    <div className="min-h-screen">
      <header>
        <h1 className="font-semibold">Blog Manager</h1>
        <p className="text-muted-foreground">
          Create and manage your blog posts and categories here.
        </p>
      </header>

      <Tabs defaultValue="blog" className="w-full mt-6">
        <TabsList className="grid grid-cols-2">
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
