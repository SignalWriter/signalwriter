import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatExtractionAsText } from "@/utils/formatExtractionAsText";
import { cn } from "@/lib/utils";

export default function CopyExtractionButton({ extraction, variant = "outline", size = "sm", className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = formatExtractionAsText(extraction);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "gap-1.5 transition-all duration-200",
        copied && "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy Extraction
        </>
      )}
    </Button>
  );
}