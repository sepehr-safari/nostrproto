import { useParams, Navigate } from 'react-router-dom';

export default function NipRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/${id}`} replace />;
}