export default function AppLogo({
  className = "",
  iconClassName = "",
  textClassName = "",
  showText = true,
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white shadow-md shadow-brand/30 ${iconClassName}`}
      >
        IM
      </span>
      {showText && (
        <span className={`font-display text-xl font-bold ${textClassName}`}>
          IntellMeet
        </span>
      )}
    </div>
  );
}
