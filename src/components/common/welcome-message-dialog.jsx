"use client";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function WelcomeMessageDialog({ open }) {
  const router = useRouter();

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[500px]" close={false}>
        <DialogHeader className="border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center pt-10 pb-10">
          <div className="mb-10">
            <img src={"/images/login/welcome-bg.png"} alt="welcome" />
          </div>

          <h3 className="text-lg font-medium text-mono text-center mb-3">
            Welcome to Jewellabel
          </h3>

          <div className="text-sm text-center text-secondary-foreground mb-7">
            Let’s set up your online store and get you ready to sell stunning
            jewelry effortlessly.
          </div>

          <div className="text-sm text-center text-secondary-foreground mb-7">
            This guided setup will take just a few minutes. We’ll help you
            configure your brand, policies, catalog preferences, pricing, and
            more.
          </div>

          <Button
            onClick={() => {
              // router.push("/business-details");
              router.push("/overview");
            }}
          >
            Let’s Get Started
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
