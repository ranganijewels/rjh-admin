import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/ui/tabs";
import StaticPageManager from "./StaticPages/StaticPageManager";
import BlogManager from "./BlogManager/BlogManager";
import FaqManager from "./FAQManager/FaqManager";
import NavigationManager from "./NavigationManager/NavigationManager";
import MegaMenuManager from "./MegaMenuManager/MegaMenuManager";

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
          <TabsList className="grid w-[80%] grid-cols-5">
            <TabsTrigger value="static-pages">Static Pages</TabsTrigger>
            <TabsTrigger value="blog">Blog Manager</TabsTrigger>
            <TabsTrigger value="faq">FAQ Manager</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="mega-menu">Mega Menu</TabsTrigger>
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

          <TabsContent value="navigation" className="mt-6">
            <NavigationManager />
          </TabsContent>

          <TabsContent value="mega-menu" className="mt-6">
            <MegaMenuManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
