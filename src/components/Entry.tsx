import { useState } from 'react';

export const Entry = ({
  createdAt,
  content,
  id,
  setIsDrawerOpen,
  setCurrentOpenMessage,
}: {
  createdAt: string;
  content: string;
  id: string;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentOpenMessage: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
}) => {
  const [lastTap, setLastTap] = useState(0);
  const DOUBLE_TAP_DELAY = 300;

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      openDialog();
      setCurrentOpenMessage(id);
    }
    setLastTap(now);
  };

  const openDialog = () => {
    setIsDrawerOpen(true);
  };

  return (
    <span
      onTouchEnd={handleTap}
      className="p-4 bg-blue-50 text-blue-800 font-bold rounded-xl"
      key={createdAt}
    >
      {content}
    </span>
  );
};
