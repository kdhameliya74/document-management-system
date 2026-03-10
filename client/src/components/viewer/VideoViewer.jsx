const VideoViewer = ({ url }) => (
  <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/10 bg-black">
    <video src={url} controls autoPlay className="w-full h-full" />
  </div>
);

export default VideoViewer;
