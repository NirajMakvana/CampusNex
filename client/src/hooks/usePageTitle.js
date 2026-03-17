import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | CampusNex` : 'CampusNex';
    return () => { document.title = prevTitle; };
  }, [title]);
};
