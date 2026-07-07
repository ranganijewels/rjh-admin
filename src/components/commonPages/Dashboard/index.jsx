"use client";
import { WelcomeMessageDialog } from "@/components/common/welcome-message-dialog";
import React, { useState } from "react";

const Dashboard = () => {
  const [profileModalOpen, setProfileModalOpen] = useState(true);
  const handleClose = () => {
    setProfileModalOpen(false);
  };

  return (
    <WelcomeMessageDialog open={profileModalOpen} onOpenChange={handleClose} />
  );
};

export default Dashboard;
