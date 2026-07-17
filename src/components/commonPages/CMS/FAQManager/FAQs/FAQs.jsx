"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/ui/accordion";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Card } from "@/components/common/ui/cards/card";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import { useCrudList } from "@/hooks/useCrudList";
import { Edit2Icon, Plus, Trash2Icon } from "lucide-react";
import React from "react";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { useCrudApi } from "@/hooks/useCrudApi";
import FAQModel from "./FAQModel";

const FAQs = () => {
  const storeId = localStorage.getItem("storeId");

  const {
    list,
    loading,
    editData,
    setEditData,
    setDeleteId,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    fetchData,
    handleDelete,
    fetchById,
  } = useCrudList(`/api/cms/faq/${storeId}/questions`);

  const { toggleStatus } = useCrudApi(`/api/cms/faq/${storeId}/questions`);

  const handleEditClick = async (categoryId) => {
    try {
      setDialogOpen(true);
      const { data } = await fetchById(categoryId);
      setEditData(data);
    } catch (err) {
      console.error("Failed to fetch question for editing", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  return (
    <>
      <div className="mt-10">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle
              text="FAQ Questions"
              className="font-semibold !text-foreground !text-lg"
            />
            <ToolbarDescription className="mt-1 font-semibold">
              Manage frequently asked questions for RJ House store
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </ToolbarActions>
        </Toolbar>
      </div>
      <Accordion type="single" collapsible>
        {loading ? (
          <p>Loading...</p>
        ) : list.length > 0 ? (
          list.map((items) => {
            return (
              <AccordionItem value={`item ${items.id}`} key={items.id}>
                <AccordionTrigger>
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" size="sm" appearance="outline">
                        {items?.faq_category_title}
                      </Badge>
                      {/* </span> */}
                      <span className="text-sm">{items?.headtitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={`${
                          items.is_active === 1 ? "success" : "primary"
                        }`}
                        size="sm"
                        appearance="outline"
                      >
                        {items.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                {(items.faqs || []).map((faq, index) => {
                  return (
                    <AccordionContent key={index}>
                      <Card>
                        <div className="flex justify-between items-start p-4 gap-4">
                          <div className="flex flex-col gap-4">
                            <div>{faq.question}</div>
                            {faq.answer && <div>{faq.answer}</div>}
                            {faq.pages?.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span>Pages:</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <ActiveToggleCell
                              id={faq.id}
                              isActive={faq.is_active}
                              toggleStatus={toggleStatus}
                            />
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                mode="icon"
                                onClick={() => {
                                  handleEditClick(faq.id);
                                }}
                              >
                                <Edit2Icon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                mode="icon"
                                onClick={() => handleDeleteClick(faq.id)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </AccordionContent>
                  );
                })}
              </AccordionItem>
            );
          })
        ) : (
          <p>No Questions found</p>
        )}
      </Accordion>

      <FAQModel
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        editData={editData}
        storeId={storeId}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
      />
    </>
  );
};

export default FAQs;
