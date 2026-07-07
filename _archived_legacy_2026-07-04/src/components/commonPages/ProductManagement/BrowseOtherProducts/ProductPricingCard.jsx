// "use client";

// import React, { useEffect, useState } from "react";
// import { useCrudApi } from "@/hooks/useCrudApi";
// import { Tag, TrendingUp, DollarSign, ArrowLeft } from "lucide-react";
// import { Badge } from "@/components/common/ui/badge";

// const ProductPricingCard = ({ subCategory, onBack, category }) => {
//   const { fetchAll: fetchPricing } = useCrudApi(
//     "/api/product-management/browse-product"
//   );

//   const [products, setProducts] = useState([]);

//   const loadData = async () => {
//     const res = await fetchPricing({
//       category_id: category?.id,
//       sub_category_id: subCategory?.id,
//       limit: 10,
//     });

//     console.log("API RESPONSE →", res);

//     // ✔ Correct key based on API example you sent
//     setProducts(res?.data?.products || []);
//   };

//   useEffect(() => {
//     if (category?.id && subCategory?.id) loadData();
//   }, [category?.id, subCategory?.id]);

//   return (
//     <div className="mt-4">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <button
//           onClick={onBack}
//           className="p-2 rounded-lg border hover:bg-gray-100"
//         >
//           <ArrowLeft className="w-5 h-5" />
//         </button>
//         <h2 className="text-xl font-semibold">{subCategory?.name} Products</h2>
//       </div>

//       {/* Products Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {products.length === 0 && (
//           <p className="text-gray-500 col-span-full text-center">
//             No products found in this collection.
//           </p>
//         )}

//         {products.map((product) => {
//           const v = product.variants?.[0]; // primary variant to display

//           return (
//             <div
//               key={product.product_id}
//               className="p-5 rounded-xl bg-white border hover:shadow-md transition space-y-4"
//             >
//               {/* Product Info */}
//               <h3 className="font-semibold text-gray-900">
//                 {product.design_no}
//               </h3>
//               <p className="text-xs text-gray-500">
//                 Category: {product.sub_category}
//               </p>

//               {/* Product Image */}
//               {v?.image && (
//                 <img
//                   src={v?.image}
//                   className="h-40 w-full object-contain rounded-lg bg-gray-50"
//                 />
//               )}

//               {/* Pricing */}
//               <div className="space-y-3 border-t pt-3">
//                 {/* Base Price */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
//                       <Tag className="text-blue-600 w-4 h-4" />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Base Price</p>
//                       <p className="text-sm font-semibold text-gray-800">
//                         ${(+v?.base_price).toLocaleString("en-US")}
//                       </p>
//                     </div>
//                   </div>
//                   <Badge variant="outline" className="text-xs">
//                     BASE
//                   </Badge>
//                 </div>

//                 {/* Selling Price */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
//                       <TrendingUp className="text-green-600 w-4 h-4" />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Selling Price</p>
//                       <p className="text-sm font-semibold text-green-700">
//                         ${(+v?.selling_price).toLocaleString("en-US")}
//                       </p>
//                     </div>
//                   </div>
//                   <Badge
//                     variant="outline"
//                     className="text-xs bg-green-50 text-green-700 border-green-200"
//                   >
//                     LIVE
//                   </Badge>
//                 </div>

//                 {/* Metal + Diamond */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
//                       <DollarSign className="text-amber-600 w-4 h-4" />
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Metal + Diamond</p>
//                       <p className="text-sm font-semibold text-amber-700">
//                         $
//                         {(+v?.diamond_amount + +v?.metal_amount).toLocaleString(
//                           "en-US"
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                   <Badge
//                     variant="outline"
//                     className="text-xs bg-amber-50 text-amber-700 border-amber-200"
//                   >
//                     COST
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ProductPricingCard;

"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, ShoppingCartIcon } from "lucide-react";
import { useCrudApi } from "@/hooks/useCrudApi";
import { Button } from "@/components/common/ui/button";
import { Checkbox } from "@/components/common/ui/checkbox";

export default function ProductPricingCard({ subCategory, onBack, category }) {
  const { fetchAll: fetchPricing } = useCrudApi(
    "/api/product-management/browse-product"
  );

  const [products, setProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // const loadData = async () => {
  //   const res = await fetchPricing(
  //     {
  //       category_id: category?.id,
  //       subcategory_id: subCategory?.id,
  //       limit: 10,
  //     },
  //     "POST"
  //   );

  //   setProducts(res?.data?.products || []);
  // };

  const loadData = async () => {
    const res = await fetchPricing(
      {
        category_id: category?.id,
        subcategory_id: subCategory?.id,
        limit: 10,
        page: 1,
      },
      "POST"
    );

    setProducts(res?.data?.products || []);
    setPage(res?.data?.pagination?.current_page || 1);
    setLastPage(res?.data?.pagination?.last_page || 1);
  };

  const loadMore = async () => {
    if (page >= lastPage) return;

    setLoadingMore(true);

    const nextPage = page + 1;

    const res = await fetchPricing(
      {
        category_id: category?.id,
        subcategory_id: subCategory?.id,
        limit: 10,
        page: nextPage,
      },
      "POST"
    );

    setProducts((prev) => [...prev, ...(res?.data?.products || [])]);
    setPage(nextPage);

    setLoadingMore(false);
  };

  useEffect(() => {
    if (category?.id && subCategory?.id) loadData();
  }, [category?.id, subCategory?.id]);

  const toggleVariant = (productId, variantId) => {
    setSelectedVariants((prev) => {
      const key = `${productId}_${variantId}`;
      const updated = { ...prev };
      updated[key] = !updated[key];
      return updated;
    });
  };

  const totalSelected = Object.values(selectedVariants).filter(Boolean).length;

  const METAL_COLORS = {
    YELLOW: "#D4A017",
    WHITE: "#D9D9D9",
    ROSE: "#E7A1A1",
  };

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">{subCategory?.name}</h2>
      </div>

      {/* Product Container */}
      {products.map((product) => {
        return (
          <div key={product.product_id} className="bg-white p-6 mb-6 shadow-sm">
            {/* Product Header */}
            <div className="flex gap-6">
              {/* Image */}
              <div className="w-40 h-40 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={product?.variants?.[0]?.image}
                  alt=""
                  className="object-contain h-full w-full"
                />
              </div>

              {/* Info */}
              <div>
                <h3 className="text-lg font-semibold">{product.design_no}</h3>
                <p className="text-sm text-gray-600">
                  Style: {product?.style || "—"}
                </p>
                <p className="text-sm text-gray-600">
                  Collection: {product?.collection || "—"}
                </p>
                <p className="text-sm text-gray-600">
                  Category: {product?.sub_category}
                </p>
              </div>
            </div>

            {/* Variants Table */}
            <div className="mt-6 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-3 text-left w-10"></th>
                    <th className="p-3 text-left">Variant</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Store Price</th>
                    <th className="p-3 text-left">Retail Price</th>
                    <th className="p-3 text-left">Metal</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {product.variants?.map((v) => {
                    const key = `${product.product_id}_${v.variant_id}`;

                    return (
                      <tr
                        key={v.variant_id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        {/* Checkbox */}
                        <td className="p-3">
                          <Checkbox
                            checked={selectedVariants[key] || false}
                            onCheckedChange={() =>
                              toggleVariant(product.product_id, v.variant_id)
                            }
                          />
                        </td>

                        {/* Variant icon */}
                        <td className="p-3">
                          <img
                            src={v?.image}
                            alt=""
                            className="h-20 w-20 object-contain"
                          />
                        </td>

                        <td className="p-3">{v?.variant_shape}</td>

                        {/* Prices */}
                        <td className="p-3 text-gray-800">
                          ${Number(v?.base_price).toLocaleString("en-US")}
                        </td>

                        <td className="p-3 text-gray-800">
                          ${Number(v?.selling_price).toLocaleString("en-US")}
                        </td>

                        {/* Metal swatches */}
                        <td className="p-3">
                          <div className="flex gap-1">
                            {v.metal_color?.map((m, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 border"
                                style={{ backgroundColor: METAL_COLORS[m] }}
                              />
                            ))}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="md"
                            className="flex items-center gap-3"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            Add
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Variant Count + Estimated Price */}
            <div className="mt-4 flex justify-between text-sm text-gray-700 px-1">
              <p>
                Variants Selected:{" "}
                <span className="font-semibold">
                  {
                    product.variants.filter(
                      (v) =>
                        selectedVariants[
                          `${product.product_id}_${v.variant_id}`
                        ]
                    ).length
                  }
                </span>
                /{product.variants.length}
              </p>

              <p>
                Estimated Price:{" "}
                <span className="font-semibold">
                  $
                  {product.variants
                    .filter(
                      (v) =>
                        selectedVariants[
                          `${product.product_id}_${v.variant_id}`
                        ]
                    )
                    .reduce((sum, v) => sum + Number(v.selling_price || 0), 0)
                    .toLocaleString("en-US")}
                </span>
              </p>
            </div>
          </div>
        );
      })}

      {/* Bottom Fixed Bar */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t p-4 flex items-center justify-between rounded-b-xl shadow-md">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Total Products Selected: </span>
          {totalSelected}
        </p>

        <div className="flex items-center gap-3">
          <Button variant="outline">Previous</Button>
          <Button>Next</Button>
        </div>
      </div>
    </div>
  );
}
