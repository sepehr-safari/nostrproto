import { NostrEvent } from '@nostrify/nostrify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EventSourceDialogProps {
  event: NostrEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventSourceDialog({ event, open, onOpenChange }: EventSourceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Event Source</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap break-all">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}