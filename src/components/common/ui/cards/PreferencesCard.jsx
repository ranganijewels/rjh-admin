"use client";

import { Card, CardContent, CardFooter } from "./card";
import { AvatarSingle } from "@/components/common/ui/avatar-single";
import Link from "next/link";
import { Button } from "../button";

export const PreferencesCard = ({ data, selected }) => {
  return (
    <Card
      className={`max-w-full overflow-hidden border-2 transition-all ${
        selected ? "border-primary shadow-md" : "border-border"
      }`}
    >
      <div
        className="relative h-[230px] w-full bg-cover bg-top"
        style={{ backgroundImage: `url(${data?.cover_image})` }}
      />

      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <AvatarSingle
              image={data?.logo}
              imageClass={
                "object-cover rounded-[20px] w-[50px] h-28 md:w-32 md:h-28 -mt-12 md:-mt-20 shrink-0 relative top-[2px]"
              }
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {/* title */}
                <Link
                  href="#"
                  className="text-lg font-semibold text-foreground hover:text-primary-active"
                >
                  {data.title}
                </Link>
                <span className="inline-flex items-center justify-center rounded-full bg-red-50 p-1">
                  <img src="/images/verify.svg" alt="Verified" />
                </span>
              </div>
              {/* description */}
              <span className="text-muted-foreground text-sm max-w-[400px]">
                {data.description}
              </span>
            </div>
          </div>

          {/* Pages thumbnails Grid */}
          {data.thumbnail?.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full pt-2">
                {data.thumbnail.map((work, index) => (
                  <Card key={work.id || `thumb-${index}`}>
                    <CardContent className={"bg-muted/5 cursor-pointer p-0"}>
                      <img
                        src={work.image}
                        alt={work.title}
                        className="w-full h-[180px] object-cover rounded-[20px]"
                      />
                    </CardContent>
                    <CardFooter className="justify-start">
                      <Button mode="link">
                        <span className="text-sm font-medium text-foreground">
                          {work.title}
                        </span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* sections details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-6">
                <ThemeCard
                  title={data.section_title_1}
                  content={data.section_description_1}
                />
                <ThemeCard
                  title={data.section_title_2}
                  content={data.section_description_2}
                />
                <ThemeCard
                  title={data.section_title_3}
                  content={data.section_description_3}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link href="#">Preview Live Demo</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Extracted reusable component for theme info cards
const ThemeCard = ({ title, content }) => (
  <Card className="bg-white border-2 border-dashed border-gray-300 ">
    <CardContent className="">
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{content}</p>
    </CardContent>
  </Card>
);
