import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

interface CollaborativeCursorProps {
  cursors: Cursor[];
}

const CURSOR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2'
];

export function CollaborativeCursor({ cursors }: CollaborativeCursorProps) {
  const [userColors, setUserColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newColors = { ...userColors };
    cursors.forEach((cursor, index) => {
      if (!newColors[cursor.userId]) {
        newColors[cursor.userId] = CURSOR_COLORS[index % CURSOR_COLORS.length];
      }
    });
    setUserColors(newColors);
  }, [cursors]);

  return (
    <AnimatePresence>
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.userId}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, x: cursor.x, y: cursor.y }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed pointer-events-none z-50"
          style={{
            left: 0,
            top: 0
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.65376 12.3673L13.0587 4.96234C13.6948 4.32629 14.7582 4.54813 15.0822 5.38625L18.8484 15.7369C19.1723 16.575 18.4971 17.4607 17.6005 17.4607H13.2207L11.6776 22.3481C11.4743 23.0057 10.6086 23.0057 10.4053 22.3481L8.86224 17.4607H5.65376C4.75715 17.4607 4.08192 16.575 4.40588 15.7369L8.17206 5.38625C8.49602 4.54813 9.55947 4.32629 10.1955 4.96234L5.65376 12.3673Z"
              fill={userColors[cursor.userId] || CURSOR_COLORS[0]}
            />
          </svg>
          <div
            className="ml-6 -mt-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: userColors[cursor.userId] || CURSOR_COLORS[0] }}
          >
            {cursor.userName}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
