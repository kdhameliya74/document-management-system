import { Loader } from "lucide-react";
const Loading = ({ text = "Loading...", extraClass = null }) => {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 ${extraClass}`}
    >
      <Loader size={32} className="animate-spin text-primary" />
      <div className="text-text-muted">{text}</div>
    </div>
  );
};

export default Loading;
