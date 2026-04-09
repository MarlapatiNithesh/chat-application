import React, { useEffect, useRef } from "react";
import dp from "../assets/dp.png";
import { useSelector } from "react-redux";

function ReceiverMessage({ image, message }) {
  const scrollRef = useRef();
  const { selectedUser } = useSelector((state) => state.user);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message, image]);

  const handleImageLoad = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full flex justify-start px-4">
      <div className="flex items-end gap-2 max-w-[75%]" ref={scrollRef}>
        <img
          src={selectedUser?.image || dp}
          alt="user"
          className="w-8 h-8 rounded-full object-cover shadow"
        />
        <div className="flex flex-col items-start gap-1 p-3 bg-[#e4e6eb] rounded-2xl rounded-tl-none shadow-md text-black text-sm">
          {image && (
            <img
              src={image}
              alt="received"
              className="w-48 h-auto max-h-60 object-cover rounded-xl"
              onLoad={handleImageLoad}
            />
          )}
          {message && <span className="break-words">{message}</span>}
        </div>
      </div>
    </div>
  );
}

export default ReceiverMessage;
