import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
// Import CSS via import statement (works with Vite)
import 'react-quill/dist/quill.snow.css';
import { FiBold, FiItalic, FiList, FiLink, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Write something...',
  maxLength = 10000,
  disabled = false,
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [internalValue, setInternalValue] = useState(value || '');
  const isUserChangeRef = useRef(false);

  // Sync external value changes to internal state (but not if it's a user change)
  useEffect(() => {
    if (!isUserChangeRef.current) {
      setInternalValue(value || '');
    }
    isUserChangeRef.current = false;
  }, [value]);

  // Custom toolbar modules - memoized to prevent re-renders
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        // Custom image handler
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              // Here you would upload the image and get the URL
              // For now, we'll use a placeholder
              const reader = new FileReader();
              reader.onload = (e) => {
                const range = quillRef.current?.getEditor().getSelection();
                if (range) {
                  quillRef.current?.getEditor().insertEmbed(range.index, 'image', e.target?.result);
                }
              };
              reader.readAsDataURL(file);
            }
          };
        },
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'font', 'size',
    'align', 'script', 'direction',
  ], []);

  const handleChange = useCallback((content: string) => {
    // Remove HTML tags for character count
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    // Normalize empty content - ReactQuill returns <p><br></p> or <p></p> for empty content
    const isEmpty = !textContent || textContent.length === 0;
    const normalizedContent = isEmpty ? '' : content;
    
    if (textContent.length <= maxLength) {
      // Mark as user change to prevent sync loop
      isUserChangeRef.current = true;
      setInternalValue(normalizedContent);
      onChange(normalizedContent);
    } else {
      // If content exceeds maxLength, don't update and show error
      toast.error(`Description must be less than ${maxLength} characters`);
    }
  }, [maxLength, onChange]);

  const handleSaveDraft = useCallback(() => {
    localStorage.setItem('task_description_draft', internalValue);
    toast.success('Draft saved locally');
  }, [internalValue]);

  const handleLoadDraft = useCallback(() => {
    const draft = localStorage.getItem('task_description_draft');
    if (draft) {
      isUserChangeRef.current = true;
      setInternalValue(draft);
      onChange(draft);
      toast.success('Draft loaded');
    }
  }, [onChange]);

  const getCharacterCount = () => {
    return internalValue.replace(/<[^>]*>/g, '').length;
  };

  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  return (
    <div className="rich-text-editor">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Rich Text Editor</span>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center text-primary-600 hover:text-primary-700"
            title="Save draft"
            disabled={disabled}
          >
            <FiSave className="w-4 h-4 mr-1" />
            Save
          </button>
          <button
            type="button"
            onClick={handleLoadDraft}
            className="text-primary-600 hover:text-primary-700"
            title="Load draft"
            disabled={disabled}
          >
            Load
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {getCharacterCount()}/{maxLength} characters
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className="h-64"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center">
          <FiBold className="w-4 h-4 mr-1" />
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+B</kbd>
        </div>
        <div className="flex items-center">
          <FiItalic className="w-4 h-4 mr-1" />
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+I</kbd>
        </div>
        <div className="flex items-center">
          <FiList className="w-4 h-4 mr-1" />
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Shift+L</kbd>
        </div>
        <div className="flex items-center">
          <FiLink className="w-4 h-4 mr-1" />
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+K</kbd>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;