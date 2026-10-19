"use client";

import { useState, useEffect, useMemo } from "react";
import { Users } from "lucide-react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { DataGridEmpty } from "@/components/common/ui/data-grid";
import { Page, PageHeader } from "@/components/common/ui/page";
import { useCustomerData } from "./hooks/userCustomerData";
import { DataGridToolbar } from "@/components/common/DataGridToolBar";
import { useCrudApi } from "@/hooks/useCrudApi";

const AllCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { fetchAll } = useCrudApi("/api/customer-data");

  const columns = useCustomerData();

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await fetchAll();

        const mappedCustomers = (result?.data?.data || []).map((c) => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
        }));

        setCustomers(mappedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [fetchAll]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return customers;
    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, customers]);

  if (!loading && filteredData.length === 0) {
    return (
      <DataGridEmpty
        icon={<Users className="size-8" />}
        title="No customers found"
        description="Customers will appear here once they are added."
      />
    );
  }

  return (
    <Page>
      <PageHeader
        title="Customers"
        description="Everyone who has an account on the storefront, with the contact details the team uses to follow up."
      />

      <ListWithCardToggle
        titleAs="none"
        data={filteredData}
        columns={columns}
        useFilteredData={null}
        loading={loading}
        resizableColumns
        infiniteScroll
      />
    </Page>
  );
};

export default AllCustomer;
