import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextEditorMenuBar from "./TextEditorMenuBar";
import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  onChange: (content: string) => void;
  onPageOverflow: (overflowContent: string) => void;
  initialContent?: string;
  pageIndex: number;
};

const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;
const PADDING = 96;
const CONTENT_HEIGHT = PAGE_HEIGHT - (PADDING * 2); // 864px

export default function RichTextEditor({
  onChange,
  onPageOverflow,
  initialContent = "",
  pageIndex,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor container
  const lastContentRef = useRef<string>(""); // Reference to the last content

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML(); // Get the current content
      onChange(content); // Notify parent of content change
      checkForOverflow(content); 
    },
    editorProps: {
      attributes: {
        class: "h-full w-full cursor-text focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialContent !== lastContentRef.current) {
      editor.commands.setContent(initialContent);
      lastContentRef.current = initialContent;
    } // Ensure the editor updates when initialContent changes
  }, [editor, initialContent, pageIndex]);

  const checkForOverflow = (content: string) => {
    const editorElement = editorRef.current?.querySelector(".ProseMirror"); // Get the ProseMirror element
    if (!editorElement || !editor) return;

    if (editorElement.scrollHeight > CONTENT_HEIGHT) { // Check if content height exceeds the limit
      const elements = Array.from(editorElement.children); // Get all child elements
      if (elements.length <= 1) return; 

      let accumulatedHeight = 0; 
      let splitIndex = 0;

      for (let i = 0; i < elements.length; i++) {
        const elementHeight = (elements[i] as HTMLElement).offsetHeight; // Get the height of the element
        if (accumulatedHeight + elementHeight > CONTENT_HEIGHT * 1.0) { 
          splitIndex = Math.max(1, i); 
          break;
        }
        accumulatedHeight += elementHeight;
      }

      if (splitIndex > 0 && splitIndex < elements.length) {
        const overflowContent = elements
          .slice(splitIndex)
          .map((el) => el.outerHTML)
          .join("");
        
        const remainingContent = elements
          .slice(0, splitIndex)
          .map((el) => el.outerHTML)
          .join("");

        editor.commands.setContent(remainingContent);
        onChange(remainingContent);

        if (overflowContent.trim()) {
          onPageOverflow(overflowContent);
        }
      }
    }
  };

  return (
    <div className="mx-auto" style={{ width: PAGE_WIDTH }}>
      <TextEditorMenuBar editor={editor} />
      
      {/* Page Container */}
      <div 
        className="bg-white border border-gray-300 shadow-lg"
        style={{ 
          width: PAGE_WIDTH, 
          height: PAGE_HEIGHT,
          padding: PADDING
        }}
      >
        <div
          ref={editorRef}
          style={{ height: CONTENT_HEIGHT }}
          className="overflow-hidden"
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500 text-center">
        Page {pageIndex + 1} • {PAGE_WIDTH}×{PAGE_HEIGHT}px
      </div>
    </div>
  );
}
