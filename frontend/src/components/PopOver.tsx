import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

interface PopOverProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  url?: string;
  message: string;
  children: React.ReactNode;
  text?: string;
}
const PopOver: React.FC<PopOverProps> = ({
  top,
  left,
  right,
  bottom,
  url,
  message,
  children,
  text = "",
}) => {
  const [PopOver, setPopOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current); // clear any hide timer
    timerRef.current = setTimeout(() => setPopOver(true), 150); // delay before show
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current); // clear any show timer
    timerRef.current = setTimeout(() => setPopOver(false), 200); // delay before hide
  };

  let className = "relative";

  if (React.isValidElement(children)) {
    if (
      children.type === "a" ||
      children.type === "span" ||
      children.type === Link
    ) {
      className = "relative inline-flex w-fit";
    } else {
      className = "relative w-full";
    }
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}>
      {children}
      {PopOver && (
        <span
          className={`absolute border inline-block border-white bg-gray-900 text-white text-sm px-2 py-1 sm:whitespace-nowrap ${
            url
              ? "w-50 sm:w-fit"
              : message.length > 27
              ? "w-50 sm:w-fit"
              : "w-fit whitespace-nowrap"
          } `}
          style={{
            right: right,
            top: top,
            left: left,
            bottom: bottom,
            color: text,
          }}>
          <p>
            {message}{" "}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline cursor-pointer hover:text-blue-400 active:text-blue-600">
                see code instead
              </a>
            )}
          </p>
        </span>
      )}
    </div>
  );
};

export default PopOver;
