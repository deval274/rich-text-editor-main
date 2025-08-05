import {
    RiBold,
    RiItalic,
  } from "react-icons/ri";
  import { Editor } from "@tiptap/react";
  import { BsTypeUnderline } from "react-icons/bs";

  const Button = ({
    onClick,
    isActive,
    disabled,
    children,
  }: {
    onClick: () => void;
    isActive: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 ${isActive ? "bg-violet-500 text-white rounded-md" : ""}`}
    >
      {children}
    </button>
  );

  export default function TextEditorMenuBar({
    editor,
  }: {
    editor: Editor | null;
  }) {
    if (!editor) return null;
  
    const buttons = [
      {
        icon: <RiBold className="size-5" />,
        onClick: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
      },
      {
        icon: <BsTypeUnderline className="size-5" />,
        onClick: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
      },
      {
        icon: <RiItalic className="size-5" />,
        onClick: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        disabled: !editor.can().chain().focus().toggleItalic().run(),
      },    
    ];
  
    return (
      <div className="mb-2 flex space-x-2">
        {buttons.map(({ icon, onClick, isActive, disabled }, index) => (
          <Button
            key={index}
            onClick={onClick}
            isActive={isActive}
            disabled={disabled}
          >
            {icon}
          </Button>
        ))}
      </div>
    );
  }
  