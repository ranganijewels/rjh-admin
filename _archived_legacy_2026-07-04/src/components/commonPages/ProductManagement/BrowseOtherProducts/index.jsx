// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { useCrudApi } from "@/hooks/useCrudApi";
// import FolderCollections from "./FolderCollections";

// export default function BrowseOtherProducts({ params }) {
//   const { slug } = params;
//   const searchParams = useSearchParams();
//   const categoryId = searchParams.get("category_id");

//   const { fetchAll } = useCrudApi(
//     `/api/pricing-margin/by-category/${categoryId}/collections`
//   );

//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await fetchAll();
//         if (res?.status) {
//           setCollections(res.data || []);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [categoryId]);

//   return (
//     <FolderCollections
//       category={slug}
//       products={collections}
//       loading={loading}
//     />
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCrudApi } from "@/hooks/useCrudApi";
import FolderCollections from "./FolderCollections";
import ProductPricingCard from "./ProductPricingCard";

export default function BrowseOtherProducts({ params }) {
  const { slug } = params;
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id");

  const { fetchAll } = useCrudApi(
    `/api/pricing-margin/by-category/${categoryId}/collections`
  );

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAll();
        if (res?.status) setCollections(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  return (
    <>
      <FolderCollections
        category={{ name: slug, id: categoryId }} // IMPORTANT FIX
        products={collections}
        loading={loading}
        onBack={() => window.history.back()}
        onSelectSubCategory={(sub) => setSelectedSubCategory(sub)}
      />

      <ProductPricingCard
        open={!!selectedSubCategory}
        onClose={() => setSelectedSubCategory(null)}
        subCategory={selectedSubCategory}
      />
    </>
  );
}
