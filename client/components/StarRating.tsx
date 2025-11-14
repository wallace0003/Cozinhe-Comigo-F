interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 40,
  interactive = false,
  onRate 
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onRate) {
      onRate(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: maxRating }).map((_, index) => (
        <button
          key={index}
          onClick={() => handleClick(index)}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.3702 4.79028C18.5094 2.71521 21.4906 2.71521 22.6298 4.79028L25.5736 10.1527C26.0045 10.9375 26.7634 11.4889 27.643 11.6562L33.6527 12.7989C35.9782 13.2411 36.8994 16.0764 35.278 17.801L31.0877 22.2579C30.4744 22.9102 30.1845 23.8023 30.2973 24.6906L31.0676 30.7592C31.3657 33.1075 28.9538 34.8598 26.8125 33.8507L21.2789 31.2428C20.469 30.8611 19.531 30.8611 18.7211 31.2428L13.1875 33.8507C11.0462 34.8598 8.63433 33.1075 8.93242 30.7592L9.70272 24.6906C9.81547 23.8023 9.52559 22.9102 8.91229 22.2579L4.72205 17.801C3.10057 16.0764 4.02181 13.2411 6.34734 12.7989L12.357 11.6562C13.2366 11.4889 13.9955 10.9375 14.4264 10.1527L17.3702 4.79028Z"
              fill={index < rating ? "#FFF220" : "#CDCDCD"}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
