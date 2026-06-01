import { useNavigate } from 'react-router-dom';
import PumpSelection from '@/features/common/components/PumpSelection';

export default function NPDProjects() {
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/npd/${categoryId}`);
  };

  return (
    <PumpSelection
      moduleType="npd"
      moduleLabel="NPD"
      moduleDescription="New Product Development"
      badgeColor="bg-blue-600"
      onCategorySelect={handleCategorySelect}
    />
  );
}
