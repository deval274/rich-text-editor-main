"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner"
import RichTextEditor from "./RichTextEditor";
import LoadingBtn from "./LoadingBtn";
import { createDocument } from "@/app/actions";
import { z } from "zod";

const documentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function AddDocument() {
  const [pages, setPages] = useState<string[]>([""]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: { title: "" },
  });

  const { handleSubmit, control, formState: { isSubmitting } } = form;

  const handlePageContentChange = (content: string) => {
    setPages(prev => {
      const updated = [...prev]; // Create a copy of the pages array
      updated[currentPageIndex] = content; // Update the content of the current page
      return updated;
    }); 
  };

  const handlePageOverflow = (overflowContent: string) => {
    setPages(prev => [...prev, overflowContent]);
    setCurrentPageIndex(pages.length);
    toast("New page created",{
      description: `Content moved to page ${pages.length + 1}`,
    });
  };

  const addNewPage = () => {
    setPages(prev => [...prev, ""]); // Add an empty page
    setCurrentPageIndex(pages.length); // Switch to the new page
  };

  const goToPage = (pageIndex: number) => setCurrentPageIndex(pageIndex);

  const deletePage = (pageIndex: number) => {
    if (pages.length === 1) {
      toast( "Cannot delete",{
        description: "Document must have at least one page.",
      });
      return;
    }

    setPages(prev => prev.filter((_, i) => i !== pageIndex)); // Remove the specified page
    if (currentPageIndex >= pages.length - 1) {
      setCurrentPageIndex(Math.max(0, pages.length - 2)); // Ensure we don't go out of bounds
    } // Adjust current page index if necessary
  };

  async function onSubmit(values: DocumentFormValues) {
    try {
      const nonEmptyPages = pages.filter(page => page.trim());
      
      if (!nonEmptyPages.length) {
        toast("Error",{
          description: "Please add content to at least one page.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("pages", JSON.stringify(nonEmptyPages));

      await createDocument(formData);
      toast("Succes",{description: "Document created successfully!" });
    } catch (error) {
      toast("Error",{
        description: "Failed to create document. Please try again.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Form {...form}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter document title..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Page Navigation */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Page {currentPageIndex + 1} of {pages.length}
                {pages.length > 1 && currentPageIndex < pages.length - 1 && (
                  <span className="ml-2 text-sm text-amber-600 font-normal">
                    (Read Only)
                  </span>
                )}
              </h3>
              <Button type="button" onClick={addNewPage} variant="outline" size="sm">
                Add Page
              </Button>
            </div>

            {/* Page Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              {pages.map((_, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Button
                    type="button"
                    onClick={() => goToPage(index)}
                    variant={currentPageIndex === index ? "default" : "outline"}
                    size="sm"
                  >
                    {index + 1}
                  </Button>
                  {pages.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => deletePage(index)}
                      variant="destructive"
                      size="sm"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => goToPage(currentPageIndex - 1)}
                disabled={currentPageIndex === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={() => goToPage(currentPageIndex + 1)}
                disabled={currentPageIndex === pages.length - 1}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            key={currentPageIndex}
            onChange={handlePageContentChange}
            onPageOverflow={handlePageOverflow}
            initialContent={pages[currentPageIndex]}
            pageIndex={currentPageIndex}
            isReadOnly={pages.length > 1 && currentPageIndex < pages.length - 1}
          />

          <LoadingBtn type="submit" loading={isSubmitting}>
            Create Document
          </LoadingBtn>
        </form>
      </Form>
    </div>
  );
}