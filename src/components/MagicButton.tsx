import { useState } from 'react';
import { FeaturePopup } from './FeaturePopup';

interface ImportJsonData {
  nodes?: Array<{
    name: string;
    technology?: string;
    position?: { x: number; y: number };
  }>;
  connections?: Array<{
    from: string;
    to: string;
  }>;
}

interface MagicButtonProps {
  onImportJson: (jsonData: ImportJsonData) => void;
}

export function MagicButton({ onImportJson }: MagicButtonProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleTogglePopup = () => {
    setShowPopup(prev => !prev);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {/* Magic Button */}
      <button
        className="magic-button"
        onClick={handleTogglePopup}
        title="Magic Features"
      >
        ✨
      </button>

      {/* Feature Popup */}
      {showPopup && (
        <FeaturePopup
          onClose={handleClosePopup}
          onImportJson={onImportJson}
        />
      )}
    </>
  );
}
