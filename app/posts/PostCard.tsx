"use client";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { FileText, Clock } from "lucide-react";
import Image from "next/image";

// Type for document from getAllDocuments
type DocumentSummary = {
  id: string;
  title: string;
  slug: string;
  totalPages: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function DocumentCard({
  document,
}: {
  document: DocumentSummary;
}) {
  const created = dayjs(document.createdAt).format("DD MMM YYYY");

  return (
    <div className="group rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative max-h-48 max-w-md overflow-hidden rounded-md">
        <Image
          src="/images.png"
          alt=""
          width={1280}
          height={853}
          className={cn(
            "-z-10 aspect-square h-48 w-48 object-cover transition-all hover:scale-105"
          )}
        />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {document.totalPages} page{document.totalPages !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          Title : {document.title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Created At: {created}</span>
        </div>
      </div>
    </div>
  );
}

