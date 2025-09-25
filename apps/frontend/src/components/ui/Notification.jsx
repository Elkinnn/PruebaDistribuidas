import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";

export default function Notification({ 
  open, 
  onClose, 
  type = "success", 
  title, 
  message, 
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [open, duration]);

  function handleClose() {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Esperar a que termine la animación
  }

  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-emerald-600" />;
      case "error":
        return <AlertCircle size={20} className="text-rose-600" />;
      case "loading":
        return <Loader2 size={20} className="text-blue-600 animate-spin" />;
      default:
        return <CheckCircle size={20} className="text-emerald-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-800";
      case "loading":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`transform transition-all duration-300 ease-in-out ${
          isVisible 
            ? "translate-x-0 opacity-100 scale-100" 
            : "translate-x-full opacity-0 scale-95"
        }`}
      >
        <div
          className={`max-w-sm rounded-xl border p-4 shadow-lg ${getColors()}`}
        >
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
              )}
              <p className="text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 rounded-lg p-1 hover:bg-black/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
