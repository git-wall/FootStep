import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TextLabel {
  id: string;
  text: string;
  position: { x: number; y: number };
}

interface TextLabelProps {
  label: TextLabel;
  isSelected: boolean;
  onSelect: (labelId: string) => void;
  onTextChange: (labelId: string, text: string) => void;
  onDelete: (labelId: string) => void;
  onPositionChange: (labelId: string, mouseEvent: React.MouseEvent) => void;
}

export function TextLabelComponent({
  label,
  isSelected,
  onSelect,
  onTextChange,
  onDelete,
  onPositionChange
}: TextLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(label.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    onTextChange(label.id, text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setText(label.text);
      setIsEditing(false);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(label.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) return; // Ignore double clicks
    
    // Don't start dragging if clicking on input or delete button
    const target = e.target as HTMLElement;
    if (target.closest('.text-input') || target.closest('.delete-label-btn')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    onPositionChange(label.id, e);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(label.id);
  };

  return (
    <div
      className={`text-label ${isSelected ? 'selected' : ''}`}
      style={{
        left: label.position.x,
        top: label.position.y,
      }}
      onClick={handleLabelClick}
      onMouseDown={handleMouseDown}
    >
      {isSelected && (
        <button
          className="delete-label-btn"
          onClick={handleDelete}
          title="Delete Text"
        >
          <X size={12} />
        </button>
      )}
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextSubmit}
          onKeyDown={handleKeyPress}
          className="text-input"
        />
      ) : (
        <span onClick={handleTextClick} className="text-content">
          {label.text || 'Click to edit'}
        </span>
      )}
    </div>
  );
}

export type { TextLabel };
