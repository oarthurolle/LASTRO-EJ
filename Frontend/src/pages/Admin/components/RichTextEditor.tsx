import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { sanitizeBlogHtml } from "../../../utils/sanitizeHtml";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

interface EditorCommand {
  command: string;
  value?: string;
  label: string;
  icon: LucideIcon;
}

const COMMANDS: EditorCommand[] = [
  { command: "bold", label: "Negrito", icon: Bold },
  { command: "italic", label: "Itálico", icon: Italic },
  { command: "insertUnorderedList", label: "Lista", icon: List },
  { command: "insertOrderedList", label: "Lista numerada", icon: ListOrdered },
  { command: "formatBlock", value: "blockquote", label: "Citação", icon: Quote },
  { command: "undo", label: "Desfazer", icon: Undo2 },
  { command: "redo", label: "Refazer", icon: Redo2 },
];

export default function RichTextEditor({
  value,
  onChange,
  hasError = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sanitizedValue = sanitizeBlogHtml(value);
    if (editorRef.current && editorRef.current.innerHTML !== sanitizedValue) {
      editorRef.current.innerHTML = sanitizedValue;
    }
  }, [value]);

  function emitSanitizedContent() {
    const editor = editorRef.current;
    if (!editor) return;
    const sanitizedContent = sanitizeBlogHtml(editor.innerHTML);
    if (editor.innerHTML !== sanitizedContent) {
      editor.innerHTML = sanitizedContent;
    }
    onChange(sanitizedContent);
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitSanitizedContent();
  }

  function addLink() {
    const url = window.prompt("Cole uma URL HTTP, HTTPS ou de e-mail:");
    if (!url) return;
    const normalizedUrl = url.trim();
    if (!/^(https?:|mailto:)/i.test(normalizedUrl)) {
      window.alert("Use um link iniciado por http://, https:// ou mailto:.");
      return;
    }
    runCommand("createLink", normalizedUrl);
  }

  return (
    <div
      className={`admin-rich-editor ${hasError ? "is-invalid" : ""}`}
    >
      <div className="admin-rich-editor__toolbar" aria-label="Formatação do texto">
        {COMMANDS.map(({ command, value: commandValue, label, icon: Icon }) => (
          <button
            key={command}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command, commandValue)}
          >
            <Icon size={16} />
          </button>
        ))}
        <span aria-hidden="true" />
        <button
          type="button"
          title="Inserir link"
          aria-label="Inserir link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
        >
          <Link size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="admin-rich-editor__content"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder="Comece a escrever o conteúdo do artigo..."
        onInput={emitSanitizedContent}
        suppressContentEditableWarning
      />
    </div>
  );
}
