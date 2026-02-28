const SharePage = () => {
  return (
    <div className="relative h-full flex flex-col px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight mb-1 h-9">
            {
              "Shared with me"
            }
          </h2>
          <p className="text-sm text-text-dim">Viewing shared content</p>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
