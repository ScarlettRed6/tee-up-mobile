import { formatPhpPrice, getPriceDisplayData } from '../utils/pricing';
import './PriceDisplay.css';

export default function PriceDisplay({
  listing,
  minimumFractionDigits = 0,
  className = '',
  currentClassName = '',
  originalClassName = '',
}) {
  const { currentPrice, originalPrice, hasMarkdown } = getPriceDisplayData(listing);

  if (currentPrice == null) {
    return <span className={`price-display ${className}`}>—</span>;
  }

  return (
    <span className={`price-display ${className}`.trim()}>
      {hasMarkdown && (
        <span className={`price-display-original ${originalClassName}`.trim()}>
          {formatPhpPrice(originalPrice, minimumFractionDigits)}
        </span>
      )}
      <span className={`price-display-current ${currentClassName}`.trim()}>
        {formatPhpPrice(currentPrice, minimumFractionDigits)}
      </span>
    </span>
  );
}
