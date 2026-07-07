import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/ui/tabs";
import StaticPageManager from "./StaticPages/StaticPageManager";
import BlogManager from "./BlogManager/BlogManager";
import FaqManager from "./FAQManager/FaqManager";

export default function CMS() {
  return (
    <div className="min-h-screen">
      <div>
        <div>
          <h1 className="text-xl font-medium leading-none text-mono">
            Content Management System
          </h1>
          <p className="text-muted-foreground text-md mt-1">
            Manage your website content from one place
          </p>
        </div>

        <Tabs defaultValue="static-pages" className="w-full mt-5">
          <TabsList className="grid w-[50%] grid-cols-3">
            <TabsTrigger value="static-pages">Static Pages</TabsTrigger>
            <TabsTrigger value="blog">Blog Manager</TabsTrigger>
            <TabsTrigger value="faq">FAQ Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="static-pages" className="mt-6">
            <StaticPageManager />
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <BlogManager />
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <FaqManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
