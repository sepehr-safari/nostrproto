import { useParams, Navigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import NipPage from './NipPage';
import NotFound from './NotFound';

export default function Nip19Page() {
  const { nip19: nip19Param } = useParams<{ nip19: string }>();
  
  if (!nip19Param) {
    return <NotFound />;
  }

  // Check if it's an official NIP (2-character hex string)
  const isOfficialNip = /^[0-9A-F]{2}$/i.test(nip19Param);
  
  if (isOfficialNip) {
    // It's an official NIP, render directly
    return <NipPage nipId={nip19Param} isOfficialNip={true} />;
  }

  // Try to decode as nip19
  try {
    const decoded = nip19.decode(nip19Param);
    
    // Check if it's a supported nip19 type
    if (decoded.type === 'naddr') {
      return <NipPage nipId={nip19Param} isOfficialNip={false} />;
    } else if (decoded.type === 'nevent' || decoded.type === 'note') {
      // For now, we'll treat these as custom NIPs too
      // You might want to handle these differently in the future
      return <NipPage nipId={nip19Param} isOfficialNip={false} />;
    } else {
      // Unsupported nip19 type, fall through to 404
      return <NotFound />;
    }
  } catch {
    // Not a valid nip19 identifier, fall through to 404
    return <NotFound />;
  }
}