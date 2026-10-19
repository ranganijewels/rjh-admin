"use client";

import { Button } from "@/components/common/ui/button";
import { Card } from "@/components/common/ui/cards/card";
import DialogContent, {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { ImageWithFallback } from "@/components/common/ui/ImageWithFallback";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Textarea } from "@/components/common/ui/textarea";
import { Separator } from "@/components/common/ui/separator";
import React, { useState } from "react";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toast } from "sonner";

const ManualOrderModel = ({ showOrderModal, setShowOrderModal, product }) => {
  const [loading, setLoading] = useState(false);

  const { create } = useCrudApi("/api/product-management/create-manual-order");

  const [orderData, setOrderData] = useState({
    metalColor: "",
    diamondType: "",
    carat_weight: "",
    metalPurity: "",
    size: "",
    quantity: "1",
    product_price: "",
    customerName: "",
    phone: "",
    email: "",
    notes: "",
  });

  const handleCreateOrder = async () => {
    try {
      setLoading(true);

      const payload = {
        product_id: product?.id,
        metal_color: orderData.metalColor,
        diamond_type: orderData.diamondType,
        carat_weight: orderData.carat_weight,
        metal_purity: orderData.metalPurity,
        size: orderData.size,
        quantity: Number(orderData.quantity),
        product_price: Number(orderData.product_price),
        customer_name: orderData.customerName,
        phone: orderData.phone,
        email: orderData.email,
        notes: orderData.notes,
      };

      const response = await create(payload);

      toast.success("Manual order created successfully!");

      setShowOrderModal(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
      <DialogContent className="max-w-2xl rounded-xl max-h-[90vh] overflow-x-auto">
        <DialogHeader>
          <DialogTitle>Create Manual Order</DialogTitle>
          <DialogDescription>
            Create a custom order for a customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <Card className="p-4 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white dark:bg-card">
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-foreground mb-1">{product.title}</p>
                <code className="text-xs bg-white dark:bg-card px-2 py-1 rounded text-gray-600 dark:text-muted-foreground">
                  {product.designNumber}
                </code>
              </div>
            </div>
          </Card>

          {/* Product Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* existing select fields */}
            <div className="space-y-2">
              <Label>Metal Color</Label>
              <Select
                value={orderData.metalColor}
                onValueChange={(value) =>
                  setOrderData((prev) => ({ ...prev, metalColor: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select metal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white-gold">18K White Gold</SelectItem>
                  <SelectItem value="yellow-gold">18K Yellow Gold</SelectItem>
                  <SelectItem value="rose-gold">18K Rose Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Diamond Type</Label>
              <Select
                value={orderData.diamondType}
                onValueChange={(value) =>
                  setOrderData((prev) => ({ ...prev, diamondType: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural Diamond</SelectItem>
                  <SelectItem value="lab">Lab-Grown Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Carat Weight</Label>
              <Select
                value={orderData.carat_weight}
                onValueChange={(value) =>
                  setOrderData((prev) => ({ ...prev, carat_weight: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select carat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5 Carat</SelectItem>
                  <SelectItem value="1.0">1.0 Carat</SelectItem>
                  <SelectItem value="1.5">1.5 Carat</SelectItem>
                  <SelectItem value="2.0">2.0 Carat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metal Purity</Label>
              <Select
                value={orderData.metalPurity}
                onValueChange={(value) =>
                  setOrderData((prev) => ({ ...prev, metalPurity: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14k">14K</SelectItem>
                  <SelectItem value="18k">18K</SelectItem>
                  <SelectItem value="22k">22K</SelectItem>
                  <SelectItem value="platinum">Platinum 950</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={orderData.size}
                onValueChange={(value) =>
                  setOrderData((prev) => ({ ...prev, size: value }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Size 5</SelectItem>
                  <SelectItem value="6">Size 6</SelectItem>
                  <SelectItem value="7">Size 7</SelectItem>
                  <SelectItem value="8">Size 8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={orderData.quantity}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                className="rounded-xl"
              />
            </div>

            {/* Product Price*/}
            <div className="space-y-2">
              <Label>Product Price ($)</Label>
              <Input
                type="number"
                min="0"
                value={orderData.product_price}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    product_price: e.target.value,
                  }))
                }
                placeholder="Enter product price"
                className="rounded-xl"
              />
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-4">
            <h4 className="text-sm text-gray-900 dark:text-foreground">Customer Information</h4>

            <div className="space-y-2">
              <Label>Customer Name*</Label>
              <Input
                value={orderData.customerName}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                placeholder="Enter customer name"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone*</Label>
                <Input
                  value={orderData.phone}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+91 98765 43210"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={orderData.email}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="customer@example.com"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={orderData.notes}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Add any special instructions or notes..."
                className="rounded-xl"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowOrderModal(false)}
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={loading}
              className="flex-1 rounded-xl bg-primary text-white"
            >
              {loading ? "Submitting..." : "Submit Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualOrderModel;
