import { useState } from "react";
import { MapPin, Smile, X } from "lucide-react";
import { FEELINGS } from "@/lib/languages";

interface Props {
  location: string;
  feeling: string;
  onLocationChange: (v: string) => void;
  onFeelingChange: (v: string) => void;
}

const LocationFeelingPicker = ({ location, feeling, onLocationChange, onFeelingChange }: Props) => {
  const [showLoc, setShowLoc] = useState(false);
  const [showFeel, setShowFeel] = useState(false);

  return (
    <div className="space-y-2">
      {(location || feeling) && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {feeling && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-body font-medium">
              {feeling}
              <button onClick={() => onFeelingChange("")} className="hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-body font-medium">
              <MapPin className="w-3 h-3" /> {location}
              <button onClick={() => onLocationChange("")} className="hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowFeel(!showFeel); setShowLoc(false); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Smile className="w-4 h-4 text-secondary" /> Feeling
          </button>
          {showFeel && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-72 overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-2 grid grid-cols-2 gap-1">
              {FEELINGS.map(f => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => { onFeelingChange(`${f.emoji} feeling ${f.label}`); setShowFeel(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded text-xs font-body text-foreground capitalize text-left"
                >
                  <span className="text-lg">{f.emoji}</span> {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowLoc(!showLoc); setShowFeel(false); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary flex items-center gap-1.5 text-xs font-bold"
          >
            <MapPin className="w-4 h-4 text-primary" /> Check in
          </button>
          {showLoc && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl p-3">
              <input
                autoFocus
                placeholder="Type a city, venue, or place..."
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full bg-muted px-3 py-2 rounded-lg text-xs font-body focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["Lahore","Karachi","Islamabad","Delhi","Mumbai","Hyderabad","Dubai","London","Toronto"].map(c => (
                  <button key={c} type="button" onClick={() => { onLocationChange(c); setShowLoc(false); }}
                    className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-body hover:bg-primary hover:text-primary-foreground transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFeelingPicker;
