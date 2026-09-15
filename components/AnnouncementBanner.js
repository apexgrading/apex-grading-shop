export default function AnnouncementBanner() {
  const message = "FREE SHIPPING ON ORDERS OVER £50";
  return (
    <div className="announcement-banner">
      <div className="announcement-track">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>{message}</span>
        ))}
      </div>
    </div>
  );
}
