// Builds the Final Review card data from live wizard data instead of
// hardcoded placeholder content. Falls back to "Not provided" for any
// field the user hasn't filled in yet.
export const getCardData = (wizardData) => {
    const profile = wizardData?.profile || {};
    const branding = wizardData?.branding || {};
    const template = wizardData?.template || {};
    const productCategories = wizardData?.product_categories || [];
    const stockSelections = wizardData?.stock_selections || [];
    const pricingMargins = wizardData?.pricing_margins || [];

    const orNotProvided = (value) => value || "Not provided";

    return [
        {
            title: "Business Details",
            content: (
                <>
                    <p>Store Name: {orNotProvided(profile.business_name)}</p>
                    <p>Email: {orNotProvided(profile.business_email)}</p>
                    <p>{orNotProvided(profile.business_address)}</p>
                    <p>Phone number: {orNotProvided(profile.business_contact)}</p>
                </>
            ),
        },

        {
            title: "Branding",
            content: (
                <>
                    <p>Logo Updated: {branding.logo_path ? "Yes" : "No"}</p>
                    <p>Primary Color: {orNotProvided(branding.primary_color)}</p>
                    <p>Secondary Color: {orNotProvided(branding.secondary_color)}</p>
                    <p>Fonts: {orNotProvided(branding.font_style)}</p>
                </>
            ),
        },

        {
            title: "Website Preference",
            content: (
                <>
                    <p>Name: {orNotProvided(template.name)}</p>
                </>
            ),
        },

        {
            title: "Product Categories",
            content: (
                <>
                    {productCategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-y-1">
                            {productCategories.map((category, idx) => (
                                <p key={idx}>{category.name || category}</p>
                            ))}
                        </div>
                    ) : (
                        <p>Not provided</p>
                    )}
                </>
            ),
        },

        {
            title: "Stock Selections",
            content: (
                <>
                    {stockSelections.length > 0 ? (
                        <div className="grid grid-cols-2 gap-y-1">
                            {stockSelections.map((stock, idx) => (
                                <p key={idx}>
                                    {stock.name} - {stock.quantity}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p>Not provided</p>
                    )}
                </>
            ),
        },

        {
            title: "Pricing Margins",
            content: (
                <>
                    {pricingMargins.length > 0 ? (
                        <div className="grid grid-cols-2 gap-y-1">
                            {pricingMargins.map((margin, idx) => (
                                <p key={idx}>
                                    {margin.name} - {margin.percentage}%
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p>Not provided</p>
                    )}
                </>
            ),
        },
    ];
};
