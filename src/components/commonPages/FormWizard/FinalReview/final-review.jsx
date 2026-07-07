import React from "react";
import { getCardData } from "./constant";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Button } from "@/components/common/ui/button";
import Link from "next/link";
import { useWizard } from "@/context/WizardContext";

export const FinalReview = () => {
  const { wizardData } = useWizard();
  const cardData = getCardData(wizardData);

  return (
    <div>
      <h2 className="text-center text-xl font-semibold mb-8">Review</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-lg mx-auto px-4">
        {cardData.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="font-bold">{card.title}</CardTitle>
              <Button mode="link" underlined="dashed">
                <Link href="#">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {card.content}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mt-6 max-w-screen-lg mx-auto px-4">
        <Link href="#" className="w-full sm:w-max">
          <Button variant="outline" className="w-full sm:w-max gap-2">
            Save Draft
          </Button>
        </Link>
        <Link href="#" className="w-full sm:w-max">
          <Button variant="outline" className="w-full sm:w-max gap-2 bg-secondary">
            Previous
          </Button>
        </Link>
        <Link href="/theme-customization" className="w-full sm:w-max">
          <Button className="w-full sm:w-max gap-2">Submit</Button>
        </Link>
      </div>
    </div>
  );
};

export default FinalReview;
