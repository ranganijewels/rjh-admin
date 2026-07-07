"use client";

import { Button } from "@/components/common/ui/button";
import DialogContent, {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Separator } from "@/components/common/ui/separator";
import { Switch } from "@/components/common/ui/switch";
import {
  Download,
  FileText,
  LinkIcon,
  Mail,
  MessageSquare,
} from "lucide-react";
import React, { useState } from "react";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toast } from "sonner";

const ShareModel = ({
  showShareModal,
  setShowShareModal,
  shareOptions,
  setShareOptions,
  product,
}) => {
  const [loading, setLoading] = useState(false);
  const [shareType, setShareType] = useState(null);

  const { create } = useCrudApi("/api/product-management/share-products");

  const handleGenerateShare = async () => {
    try {
      if (!shareType) {
        toast.error("Please select a share type (PDF, Link, WhatsApp, etc.)");
        return;
      }

      setLoading(true);

      const payload = {
        product_id: product?.id,
        images_only: shareOptions.imagesOnly,
        include_title: shareOptions.imagesWithTitle,
        include_price: shareOptions.includePrice,
        custom_price: shareOptions.customPrice
          ? Number(shareOptions.customPrice)
          : null,
        include_description: shareOptions.includeDescription,
        share_type: shareType,
      };

      const response = await create(payload);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to share product");
      }

      const shareUrl = `https://admin.therjhouse.com/share/product/${product?.id}`;

      const messageLines = [];

      if (shareOptions.include_title && product?.title) {
        messageLines.push(product.title);
      }

      if (shareOptions.include_price) {
        const priceValue = shareOptions.customPrice || product?.price || "";
        messageLines.push(`Price: ${priceValue}`);
      }

      if (shareOptions.include_description && product?.description) {
        messageLines.push(product.description);
      }

      // Always include share URL at the end
      messageLines.push(shareUrl);

      const finalMessage = messageLines.join("\n\n");

      // If PDF selected
      // If PDF selected → auto download
      if (shareType === "pdf") {
        if (!response?.pdf_url) {
          throw new Error("PDF URL not returned from server");
        }

        const link = document.createElement("a");
        link.href = response.pdf_url;
        link.download = `product-${product?.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowShareModal(false);
        setLoading(false);
        toast.success("PDF downloaded successfully");
        return;
      }

      // If Email selected
      if (shareType === "email") {
        const subject = encodeURIComponent(
          shareOptions.include_title && product?.title
            ? product.title
            : "Product Details"
        );

        const body = encodeURIComponent(finalMessage);

        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

        window.location.href = mailtoUrl;

        setShowShareModal(false);
        setLoading(false);
        return;
      }

      // If WhatsApp selected
      if (shareType === "whatsapp") {
        const whatsappText = encodeURIComponent(finalMessage);

        const whatsappUrl =
          typeof window !== "undefined" &&
          /Mobi|Android/i.test(navigator.userAgent)
            ? `whatsapp://send?text=${whatsappText}` // Mobile deep-link
            : `https://wa.me/?text=${whatsappText}`; // Desktop fallback

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");

        setShowShareModal(false);
        setLoading(false);
        return;
      }

      // Other share types (link/pdf/email etc)
      toast.success(response.message || "Share generated successfully!");
      setShowShareModal(false);
    } catch (error) {
      console.error("❌ Error generating share:", error);
      toast.error(error.message || "Something went wrong while sharing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-2xl rounded-xl max-h-[90vh] overflow-x-auto">
          <DialogHeader>
            <DialogTitle>Share Products</DialogTitle>
            <DialogDescription>
              Choose what information to include and how to share
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Share Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="images-only" className="text-sm">
                  Images Only
                </Label>
                <Switch
                  id="images-only"
                  checked={shareOptions.imagesOnly}
                  onCheckedChange={(checked) =>
                    setShareOptions((prev) => ({
                      ...prev,
                      imagesOnly: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="images-title" className="text-sm">
                  Images + Title
                </Label>
                <Switch
                  id="images-title"
                  checked={shareOptions.imagesWithTitle}
                  onCheckedChange={(checked) =>
                    setShareOptions((prev) => ({
                      ...prev,
                      imagesWithTitle: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-price" className="text-sm">
                  Include Price
                </Label>
                <Switch
                  id="include-price"
                  checked={shareOptions.includePrice}
                  onCheckedChange={(checked) =>
                    setShareOptions((prev) => ({
                      ...prev,
                      includePrice: checked,
                    }))
                  }
                />
              </div>

              {shareOptions.includePrice && (
                <Input
                  placeholder="Custom price (optional)"
                  value={shareOptions.customPrice}
                  onChange={(e) =>
                    setShareOptions((prev) => ({
                      ...prev,
                      customPrice: e.target.value,
                    }))
                  }
                  className="rounded-xl"
                />
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="include-desc" className="text-sm">
                  Include Description
                </Label>
                <Switch
                  id="include-desc"
                  checked={shareOptions.includeDescription}
                  onCheckedChange={(checked) =>
                    setShareOptions((prev) => ({
                      ...prev,
                      includeDescription: checked,
                    }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Share Output Options */}
            <div className="space-y-3">
              <Label className="text-sm">Share As</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={shareType === "link" ? "default" : "outline"}
                  className="rounded-xl gap-2"
                  onClick={() => setShareType("link")}
                >
                  <LinkIcon className="w-4 h-4" />
                  Link
                </Button>
                <Button
                  variant={shareType === "pdf" ? "default" : "outline"}
                  className="rounded-xl gap-2"
                  onClick={() => setShareType("pdf")}
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  variant={shareType === "whatsapp" ? "default" : "outline"}
                  className="rounded-xl gap-2"
                  onClick={() => setShareType("whatsapp")}
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  variant={shareType === "email" ? "default" : "outline"}
                  className="rounded-xl gap-2"
                  onClick={() => setShareType("email")}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateShare}
              disabled={loading}
              className="w-full rounded-xl bg-primary text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate & Share"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareModel;
