/**
 * Shared Tee Up logo: golf ball on tee + "Tee Up" text.
 * Used on HomePage and Admin Header.
 */
function Logo({ className = '', size = 36, showText = true }) {
  return (
    <span
      className={className}
      role="img"
      aria-label="Tee Up"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm, 8px)' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: 'var(--color-primary)', flexShrink: 0 }}
      >
        <circle cx="18" cy="10" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
        <path
          d="M18 16v14M14 30h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-family)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: size >= 32 ? 'var(--font-size-h3)' : 'var(--font-size-body)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Tee Up
        </span>
      )}
    </span>
  );
}

export default Logo;
