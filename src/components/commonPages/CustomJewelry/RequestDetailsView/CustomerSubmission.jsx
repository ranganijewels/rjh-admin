import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/common/ui/table";

const items = [
  {
    image: "/images/customer-submission.svg",
  },
  {
    image: "/images/customer-submission2.svg",
  },
  {
    image: "/images/customer-submission3.svg",
  },
  {
    image: "/images/customer-submission3.svg",
  },
];

const renderItem = (item) => {
  return <CardLocation image={item.image} />;
};
const CardLocation = ({ image }) => {
  return (
    <div className="flex flex-col items-center rounded-lg overflow-hidden">
      <img
        src={image}
        alt="Ring"
        className="w-[142px] h-[137px] object-cover rounded-xl"
      />
    </div>
  );
};

const diamondSpecs = [
  { label: "Shape", info: "Round" },
  { label: "Carat", info: "5CTW" },
  { label: "Color", info: "D-I" },
  { label: "Clarity", info: "VS1" },
  { label: "Cut", info: "Excellent" },
];

const metalSpecs = [
  { label: "Purity", info: "18K" },
  { label: "Color", info: "Yellow Gold" },
];

const otherDetails = [
  { label: "Category", info: "Ring" },
  { label: "Size", info: "8.5" },
];

const customerInfo = [
  { label: "First Name", info: "John" },
  { label: "Last Name", info: "Dow" },
  { label: "Email ID", info: "john.doe@email.com" },
  { label: "Phone No", info: "+1 962369962" },
  { label: "Preferred", info: "Email" },
  { label: "Address", info: "123 Park Chase HA9..." },
];

const renderItemAttributes = (item, index) => {
  return (
    <TableRow key={index} className="border-0">
      <TableCell className="text-sm text-secondary-foreground pb-3.5 pe-4 lg:pe-6 py-2">
        {item.label}
      </TableCell>
      <TableCell className="text-sm text-mono pb-3 py-2">{item.info}</TableCell>
    </TableRow>
  );
};

export const CustomerSubmission = () => {
  return (
    <Card className="max-w-6xl">
      <div className="w-4xl">
        <CardContent className="lg:py-7.5">
          <CardTitle className={"mb-5"}>
            Customer Submission (Form Data)
          </CardTitle>
          <div className="w-full">
            <CardTitle>Upload Image</CardTitle>
            <CardContent className="p-5 lg:p-7.5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {items.map((item, index) => (
                  <CardLocation key={index} image={item.image} />
                ))}
              </div>
            </CardContent>
          </div>
        </CardContent>
      </div>

      <div className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-accent/30 p-4">
            <h3 className="text-base font-medium mb-4">
              Diamond Specification
            </h3>
            <div className="space-y-3">
              {diamondSpecs.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-secondary-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.info}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-accent/30 p-4">
            <h3 className="text-base font-medium mb-4">Metal Specification</h3>
            <div className="space-y-3">
              {metalSpecs.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-secondary-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.info}</span>
                </div>
              ))}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Other Details</h4>
                {otherDetails.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mt-2"
                  >
                    <span className="text-sm text-secondary-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.info}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-accent/30 rounded-lg p-4">
            <h3 className="text-base font-medium mb-4">Additional Notes</h3>
            <p className="text-sm text-secondary-foreground">
              I&apos;ve looked over the rollout plan, and everything seems spot on.
              I&apos;m ready on my end and can&apos;t wait for the user feedback.
            </p>
          </div>

          <div className="bg-accent/30 rounded-lg p-4">
            <h3 className="text-base font-medium mb-4">
              Customer Contact Info
            </h3>
            <div className="space-y-3">
              {customerInfo.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-secondary-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.info}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerSubmission;
