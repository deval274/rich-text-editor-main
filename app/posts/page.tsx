import { getAllDocuments } from "@/app/actions";
import DocumentCard from "./PostCard";

export default async function AllDocuments() {
  const documents = await getAllDocuments();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Documents</h1>  
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </div>
  );
}
