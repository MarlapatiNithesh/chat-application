import React, { useEffect, useRef } from "react";
import dp from "../assets/dp.png";
import { useSelector } from "react-redux";

function SenderMessage({ image, message }) {
  const scrollRef = useRef();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, image]);

  return (
    <div className="w-full flex justify-end px-4">
      <div className="flex items-end gap-2 max-w-[75%]" ref={scrollRef}>
        <div className="flex flex-col items-end gap-1 p-3 bg-[#1797c2] rounded-2xl rounded-tr-none shadow-md text-white text-sm">
          {image && (
            <img
              src={image}
              alt="sent"
              className="w-48 h-auto max-h-60 object-cover rounded-xl"
              onLoad={() => scrollRef.current?.scrollIntoView({ behavior: "smooth" })}
            />
          )}
          {message && <span className="break-words">{message}</span>}
        </div>
        <img
          src={userData.image || dp}
          alt="you"
          className="w-8 h-8 rounded-full object-cover shadow"
        />
      </div>
    </div>
  );
}

export default SenderMessage;
