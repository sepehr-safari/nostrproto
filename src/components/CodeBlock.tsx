import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    return extractTextFromChildren((children as { props: { children: React.ReactNode } }).props.children);
  }
  
  return '';
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    try {
      // Try to get text from the DOM element first
      let text = preRef.current?.textContent || '';
      
      // Fallback to extracting from children
      if (!text) {
        text = extractTextFromChildren(children);
      }
      
      if (text) {
        await copyToClipboard(text);
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      toast.error('Failed to copy code');
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="relative group">
      <pre ref={preRef} className={className} {...props}>
        {children}
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 glass border-primary/30 hover:border-primary/50 hover:bg-primary/10 text-primary hover:text-accent"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}