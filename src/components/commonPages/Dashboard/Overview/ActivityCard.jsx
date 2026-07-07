import React from "react";
import { Button } from "@/components/common/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { TimelineItem } from "@/components/common/ui/timeline-item";
import { ArrowRight } from "lucide-react";

const ActivityCard = ({
  title = "Activity Log",
  activities = [],
  footerLink,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.map((activity, index) => (
          <TimelineItem
            key={index}
            icon={activity.icon}
            line={index < activities.length - 1}
          >
            <div className="flex flex-col gap-2">
              {activity.description === "3 New Incoming Project Files" ? (
                <>
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      3 New Incoming Project Files:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                      <img
                        src={activity.link?.href}
                        className="w-5 h-5 rounded-full object-cover"
                        alt="avatar"
                      />
                    </div>
                  </div>
                  <div className="flex gap-8 mt-2">
                    <div className="flex items-start gap-2">
                      <img
                        src="/images/icons/pdf.png"
                        alt="file icon"
                        className="w-6 h-6"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            Finance KPI App Guidelines
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          1.9mb
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <img
                        src="/images/icons/css.png"
                        alt="file icon"
                        className="w-6 h-6"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            Finance Reports
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          20mb
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Default Activity Rendering
                <>
                  <div className="text-sm text-foreground">
                    {activity.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-secondary-foreground">
                      {activity.timestamp}
                    </span>
                    {activity.link?.href && (
                      <img
                        src={activity.link.href}
                        alt="avatar"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </TimelineItem>
        ))}
      </CardContent>

      {footerLink && (
        <CardFooter className="justify-center">
          <Button mode="link" underlined="dashed" asChild>
            <span className="inline-flex items-center">
              <Link href={footerLink.href}>{footerLink.label}</Link>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ActivityCard;
