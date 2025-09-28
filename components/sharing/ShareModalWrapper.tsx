'use client';

import { useShare } from '@/lib/share/ShareContext';
import SharePreviewModal from './SharePreviewModal';

export default function ShareModalWrapper() {
  const { state, actions } = useShare();
  
  return (
    <SharePreviewModal
      isOpen={state.isShareModalOpen}
      onClose={() => actions.closeShareModal()}
    />
  );
}