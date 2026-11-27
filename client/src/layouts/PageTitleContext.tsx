import { createContext, useContext, useEffect } from 'react';

/** Lets a screen replace the top-bar title for as long as it shows something else (e.g. "Data Not Available"). */
export const PageTitleContext = createContext<(title: string | undefined) => void>(() => undefined);

/** Sets the top-bar title while `title` is given; the route's own title returns when it is undefined or the screen unmounts. */
export function useTitleOverride(title: string | undefined) {
  const setTitle = useContext(PageTitleContext);
  useEffect(() => {
    setTitle(title);
    return () => setTitle(undefined);
  }, [title, setTitle]);
}
