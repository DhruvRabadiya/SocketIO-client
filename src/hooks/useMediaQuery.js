import { useState, useEffect } from "react";

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Use the deprecated `addListener` and `removeListener` for wider browser support,
    // though `addEventListener` and `removeEventListener` are the modern standard.
    const listener = () => setMatches(media.matches);

    try {
      media.addEventListener("change", listener);
    } catch (e) {
      // Fallback for older browsers
      media.addListener(listener);
    }

    return () => {
      try {
        media.removeEventListener("change", listener);
      } catch (e) {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};
