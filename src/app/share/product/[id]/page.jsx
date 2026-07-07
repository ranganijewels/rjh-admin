import { notFound } from "next/navigation";

// Fetch product details from your backend API
async function getProduct(id) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/product/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data?.data || data; // adjust based on API response shape
  } catch (error) {
    console.error("OG Share fetch error:", error);
    return null;
  }
}

/**
 * 🔥 Dynamic OG Metadata
 * WhatsApp reads THIS — not your frontend UI.
 */
export async function generateMetadata({ params }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product)
    return {
      title: "Product Not Found",
      description: "This product may no longer exist.",
    };

  const title = product.title || "RJ House Product";
  const description =
    product.description?.slice(0, 150) ||
    "Check out this product on RJ House.";

  const image = product.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://admin.therjhouse.com/share/product/${id}`,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ---------------------------------------------------------------------

/**
 * 🔥 Page Content (for browsers only)
 * WhatsApp/FB only read META TAGS, but this page is also human-viewable.
 */
export default async function ShareProductPage({ params }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) return notFound();

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "650px",
        margin: "0 auto",
        fontFamily: "system-ui",
      }}
    >
      <h1>{product.title}</h1>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.images?.[0]}
        alt={product.title}
        width={1200}
        height={630}
        loading="lazy"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "12px",
          marginTop: "12px",
          marginBottom: "20px",
        }}
      />

      <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
        {product.description}
      </p>

      <p
        style={{
          color: "#888",
          fontSize: "14px",
          marginTop: "32px",
        }}
      >
        Product ID: {id}
      </p>
    </main>
  );
}
