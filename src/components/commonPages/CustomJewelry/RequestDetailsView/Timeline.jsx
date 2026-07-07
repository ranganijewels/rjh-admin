"use client"

import { Card, CardContent, CardTitle } from "@/components/common/ui/cards/card";
import {
    Share2,
    FileText,
    FileUp,
    FileEdit,
    CheckCircle2,
    CreditCard,
    FileCheck,
    ThumbsUp,
    Package
} from 'lucide-react';


export function TimelineItem({ line, icon: Icon, children }) {
    return (
        <div className="flex items-start relative pb-8 last:pb-0">
            {line && (
                <div className="absolute w-px h-full bg-border left-4 top-8"></div>
            )}
            <div className="flex items-center justify-center shrink-0 rounded-full bg-white border border-border w-8 h-8 z-10">
                <Icon size={16} className="text-secondary-foreground" />
            </div>
            <div className="flex-1 ml-4">
                {children}
            </div>
        </div>
    );
}

const DEFAULT_EVENTS = [
    { icon: Share2, title: "Requested", date: null, description: "Request received from customer" },
    { icon: FileText, title: "Notes added", date: null, description: "Internal notes added to the request" },
    { icon: FileUp, title: "Quotation uploaded", date: null, description: "Initial quotation shared with customer" },
    { icon: FileEdit, title: "Quotation Revised", date: null, description: "Quotation updated based on feedback" },
    { icon: CheckCircle2, title: "Quotation Final", date: null, description: "Final quotation confirmed by customer" },
    { icon: CreditCard, title: "Payment Success", date: null, description: "Payment received for the order" },
    { icon: FileCheck, title: "CAD file shared", date: null, description: "CAD design shared for customer review" },
    { icon: ThumbsUp, title: "CAD file Approved", date: null, description: "CAD design approved by customer" },
    { icon: Package, title: "Converted to product", date: null, description: "Request converted into a catalog product" },
];

const formatTimelineDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const Timeline = ({ events }) => {
    const items = Array.isArray(events) && events.length > 0 ? events : DEFAULT_EVENTS;

    return (
        <Card className={"w-full mt-5 mb-5"}>
            <div className="max-w-4xl">
                <CardContent className="lg:py-7.5">
                    <CardTitle className="mb-5">Timeline</CardTitle>
                </CardContent>
            </div>
            <div className="p-6 space-y-0">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No timeline events yet.</p>
                ) : (
                    items.map((event, index) => {
                        const Icon = event.icon;
                        const formattedDate = formatTimelineDate(event.date);
                        return (
                            <TimelineItem key={event.id ?? event.title ?? index} icon={Icon} line={index < items.length - 1}>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{event.title}</span>
                                        {formattedDate && (
                                            <span className="text-muted-foreground">{formattedDate}</span>
                                        )}
                                    </div>
                                    <span className="text-sm text-secondary-foreground">{event.description}</span>
                                </div>
                            </TimelineItem>
                        );
                    })
                )}
            </div>
        </Card>
    )
}

export default Timeline
