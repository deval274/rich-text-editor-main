"use server";

import { PrismaClient } from "../lib/generated/prisma/client";
import { toSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for document creation/update
const documentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  pages: z.array(z.string()).min(1, "At least one page is required"), // Array of HTML content for each page
});

export type DocumentValues = z.infer<typeof documentSchema>;


export async function createDocument(formData: FormData) {
  try {
    const values = Object.fromEntries(formData.entries()); // Convert FormData to a regular object
    
   
    const pagesData = values.pages ? JSON.parse(values.pages as string) : []; // Parse pages from the form data
    
    const { title, pages } = documentSchema.parse({
      title: values.title,
      pages: pagesData
    });

    const slug = toSlug(title);

    // Create document with all pages in a transaction
    const document = await prisma.$transaction(async (tx) => {
      // Create the main document
      const newDocument = await tx.document.create({
        data: {
          title,
          slug,
          totalPages: pages.length,
        },
      });

      const pageChunks = pages.map((content, index) => ({
        documentId: newDocument.id,
        pageNumber: index + 1,
        content: content,
      }));

      await tx.documentChunk.createMany({
        data: pageChunks,
      });

      return newDocument;
    });

    revalidatePath("/posts");
    redirect(`/posts`);
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}


// Get all documents (for listing page)
export async function getAllDocuments() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        totalPages: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}
