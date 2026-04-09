import { Clock } from "lucide-react";

const ProfileFrames = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
      <p className="font-body text-sm text-muted-foreground max-w-sm">
        Profile Frames are being redesigned with exciting new styles. Stay tuned for the launch!
      </p>
    </div>
  );
};

export default ProfileFrames;
