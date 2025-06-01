import { useQuery } from '@tanstack/react-query';

export interface OfficialNip {
  number: string;
  title: string;
  deprecated?: boolean;
  note?: string;
}

const parseNipsFromReadme = (readmeContent: string): OfficialNip[] => {
  const lines = readmeContent.split('\n');
  const nips: OfficialNip[] = [];
  
  for (const line of lines) {
    // Match lines that start with "- [NIP-" and extract the NIP info
    const match = line.match(/^- \[NIP-([A-F0-9]+): ([^\]]+)\]/);
    if (match) {
      const [, number, title] = match;
      
      // Check for additional notes (deprecated, unrecommended, etc.)
      let deprecated = false;

      let note: string | undefined;
      
      // Look for notes after the link
      const noteMatch = line.match(/\]\([^)]+\)\s*---\s*(.+)$/);
      if (noteMatch) {
        const noteText = noteMatch[1];
        note = noteText;
        
        // Set deprecated flag if either "unrecommended" or "deprecated" appears
        if (noteText.includes('unrecommended') || noteText.includes('deprecated')) {
          deprecated = true;
        }
      }
      
      nips.push({
        number,
        title,
        deprecated,
        note,
      });
    }
  }
  
  return nips;
};

export const useOfficialNips = () => {
  return useQuery({
    queryKey: ['official-nips'],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        'https://raw.githubusercontent.com/nostr-protocol/nips/refs/heads/master/README.md',
        { signal }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch NIPs README');
      }
      
      const content = await response.text();
      return parseNipsFromReadme(content);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};