import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PumpSelection from '@/features/common/components/PumpSelection';
import IdeaBankModal from '@/features/vave/components/IdeaBankModal';

export default function VAVEProjects() {
  const navigate = useNavigate();
  const [showIdeaBank, setShowIdeaBank] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    // Navigate to method selection screen (VA/VE choice)
    navigate(`/vave/method/${categoryId}`);
  };

  return (
    <>
      <PumpSelection
        moduleType="vave"
        moduleLabel="VA/VE"
        moduleDescription="Value Analysis / Value Engineering"
        badgeColor="bg-amber-600"
        onCategorySelect={handleCategorySelect}
        showIdeaBank={true}
        onIdeaBankClick={() => setShowIdeaBank(true)}
      />
      
      <IdeaBankModal
        isOpen={showIdeaBank}
        onClose={() => setShowIdeaBank(false)}
      />
    </>
  );
}
