"use client";
import React from "react";
import { Card } from "@/components/common/ui/cards/card";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ScrollArea } from "@/components/common/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import dynamic from "next/dynamic";
import { formatDateLong, toTitleCase } from "@/lib/utils";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { getFileType } from "@/lib/getFileType";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ProductCardView = ({ open, closeProductDetailSheet, product }) => {
  const productData = product || {
    designNo: "N/A",
    category: "N/A",
    style: "N/A",
    shape: "N/A",
    plan: "N/A",
    collection: "N/A",
    basePrice: "N/A",
    gender: "N/A",
    createdAt: "N/A",
    lastUpdatedDate: "N/A",
    grossWeight: "N/A",
    netWeight: "N/A",
    diamondWeight: "N/A",
    diamondPiece: "N/A",
    metal: "N/A",
    diamond: "N/A",
    laborRate: "N/A",
    laborPrice: "N/A",
    totalPrice: "N/A",
    active: "Yes",
  };

  const detailsArray = [
    { text: "Design No", info: productData.design_no },
    { text: "Collection", info: toTitleCase(productData.collection) },
    { text: "Gross Weight", info: productData.gross_weight },
    { text: "Metal", info: toTitleCase(productData.metal) },
    { text: "Category", info: toTitleCase(productData.category) },
    { text: "Gender", info: toTitleCase(productData.gender) },
    { text: "Net Weight", info: productData.net_weight },
    { text: "Diamond Rate", info: productData.diamond_rate },
    { text: "Style", info: toTitleCase(productData.subcategory) },
    { text: "Created At", info: formatDateLong(productData.created_at) },
    { text: "Diamond Weight", info: productData.diamond_wt },
    { text: "Labor Rate", info: productData.labour_rate },
    { text: "Shape", info: productData.occasion },
    { text: "Plan", info: productData.package || "N/A" },
    { text: "Last Updated", info: formatDateLong(productData.updated_at) },
    { text: "Diamond Piece", info: productData.diamond_pcs },
    { text: "Labor Price", info: productData.labour_amount },
    { text: "Base Price", info: productData.base_price },
    { text: "Total Price", info: productData.total_amount },
  ];

  const normalizeMaterial = (item, index) => ({
    srNo: index + 1,
    material: item.material ?? "-",
    metal: item.metal ?? "-",
    shape: item.shape ?? "-",
    quality: item.quality ?? "-",
    color: item.color ?? "-",
    size: item.size ?? "-",
    setting: item.setting ?? "-",
    pieces: item.pieces ?? item.pcs ?? "-",
    weight: item.weight ?? item.wt ?? "-",
    rate: item.rate ? `$${item.rate}` : "-",
    amount: item.amount ? `$${item.amount}` : "-",
  });

  const normalizedMaterials = product?.materials?.map(normalizeMaterial) ?? [];
  const [previewImage, setPreviewImage] = React.useState(null);

  const columns = [
    { key: "srNo", label: "Sr No.", align: "start" },
    { key: "material", label: "Material", align: "end" },
    { key: "metal", label: "Metal", align: "end" },
    { key: "shape", label: "Shape", align: "end" },
    { key: "quality", label: "Quality", align: "end" },
    { key: "color", label: "Color", align: "end" },
    { key: "size", label: "Size", align: "end" },
    { key: "setting", label: "Setting", align: "end" },
    { key: "pieces", label: "Pieces", align: "end" },
    { key: "weight", label: "Weight", align: "end" },
    { key: "rate", label: "Rate", align: "end" },
    { key: "amount", label: "Amount", align: "end" },
  ];

  return (
    <Sheet open={open} onOpenChange={closeProductDetailSheet}>
      <SheetContent
        handleClose={closeProductDetailSheet}
        className="sm:w-none md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] inset-5 start-auto h-auto rounded-lg p-0"
      >
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle>Product Info</SheetTitle>
        </SheetHeader>
        <SheetBody className="px-3 md:px-5 py-0">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] pe-3 -me-3">
            <Card className="flex flex-col space-y-3 p-5">
              {/* Product top row */}
              <div className="text-base font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label>{toTitleCase(product?.title)}</label>
                <span className="text-[14px] font-medium flex gap-[10px] items-center">
                  Active
                  <ActiveToggleCell isActive={product?.is_active} />
                </span>
              </div>
              <span className="text-sm font-normal text-foreground block mb-7">
                {product?.description || "No description added yet."}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 lg:mb-11">
                {detailsArray.map((item, index) => (
                  <div className="flex items-center gap-2.5" key={index}>
                    <span className="text-[12px] font-[400] text-foreground min-w-14 xl:min-w-24 shrink-0">
                      {item.text}
                    </span>
                    <div className="text-[14px] font-[500]">{item.info}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead
                          key={col.key}
                          className={`min-w-16 h-10 ${
                            col.align === "end" ? "text-end" : ""
                          }`}
                        >
                          {col.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {normalizedMaterials.map((row, index) => (
                      <TableRow key={index}>
                        {columns.map((col) => (
                          <TableCell
                            key={col.key}
                            className={`text-sm text-foreground ${
                              col.align === "end" ? "text-end" : ""
                            }`}
                          >
                            {col.key === "amount"
                              ? `${row[col.key]}`
                              : row[col.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Products images */}
            <div className="flex flex-wrap gap-4 md:gap-5 my-6 md:my-8 justify-center md:justify-start">
              {product?.media &&
                product?.media.map((image, index) => {
                  const { isVideo } = getFileType(image?.url);

                  return (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(image?.url)}
                      className="w-[120px] h-[120px] md:w-[144px] md:h-[144px] p-[10px] bg-[#FCFCFC] overflow-hidden cursor-pointer rounded-md"
                      key={index}
                      aria-label={`Preview product ${isVideo ? "video" : "image"} ${
                        index + 1
                      }`}
                    >
                      {isVideo ? (
                        <video
                          src={image?.url}
                          className="w-full h-full object-contain transition duration-300 hover:scale-110"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={image?.url}
                          className="w-full h-full object-contain transition duration-300 hover:scale-110"
                          alt="Product"
                        />
                      )}
                    </button>
                  );
                })}
            </div>
          </ScrollArea>
        </SheetBody>
        {previewImage && (
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center cursor-zoom-out"
            aria-label="Close image preview"
          >
            <img
              src={previewImage}
              className="max-w-[90vw] max-h-[60vh] object-contain border border-black/40 rounded-md"
              alt="Preview"
            />
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
};

export { ProductCardView, ApexChart };
