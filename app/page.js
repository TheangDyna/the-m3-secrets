"use client";
import { useState, useRef, useEffect } from "react";
import Lock from "@/app/components/icon/lock";
import User from "@/app/components/icon/user";
import Send from "@/app/components/icon/send";
import ArrowSmallDown from "@/app/components/icon/arrowSmallDown";
import Eye from "./components/icon/eye";
import EyeSlash from "./components/icon/eyeSlash";

const Home = () => {
  const [num, setNum] = useState(31);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);
  const shouldFollowLastMessageRef = useRef(true);
  const [inputName, setInputName] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [show, setShow] = useState(false);
  const [isEmptyName, setIsEmptyName] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedKey = localStorage.getItem("secretKey");
    console.log(storedName);
    console.log(storedKey);
    if (storedName) {
      setInputName(storedName);
    }
    if (storedKey) {
      setInputKey(storedKey);
    }
  }, []);

  useEffect(() => {
    const isAtBottom = () => {
      const container = chatContainerRef.current;
      if (!container) return true;
      return (
        container.scrollHeight - container.scrollTop === container.clientHeight
      );
    };

    const handleScroll = () => {
      shouldFollowLastMessageRef.current = isAtBottom();
      setShowScrollButton(!isAtBottom());
    };

    chatContainerRef.current.addEventListener("scroll", handleScroll);

    return () => {
      chatContainerRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (shouldFollowLastMessageRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [num]);

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    setShowScrollButton(false);
  };

  // setTimeout(() => setNum(num + 1), 1000);

  const handleChangeName = (event) => {
    setInputName(event.target.value.substring(0, 10));
  };

  const handleChangeKey = (event) => {
    setInputKey(event.target.value.substring(0, 10));
  };

  const handleSaveName = () => {
    localStorage.setItem("userName", inputName);
  };

  const handleSaveKey = () => {
    localStorage.setItem("secretKey", inputKey);
  };

  const handleSend = () => {
    if (inputName == "" || null) {
      setIsEmptyName(true);
      console.log(isEmptyName);
      setTimeout(() => setIsEmptyName(false), 3000);
      return;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex justify-center py-5 text-xl font-medium">
        The M3 Secrects
      </div>
      <div
        ref={chatContainerRef}
        style={{
          backgroundImage: "url('/skulls.svg')",
          scrollBehavior: "smooth",
        }}
        className="w-full flex flex-1 justify-center overflow-y-auto"
      >
        <div className="min-h-full w-[800px] h-fit flex flex-col justify-end">
          {Array.from({ length: num }).map((item, index) => (
            <div key={index} className="chat chat-start">
              <div className="chat-bubble">
                It's over Anakin, I have the high ground {index}.
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="w-[800px] py-3 flex items-center gap-1">
          <div
            class={isEmptyName ? "tooltip tooltip-secondary tooltip-open" : ""}
            data-tip="Whooo are you!"
          >
            <button
              className="btn btn-square btn-ghost"
              onClick={() => window.user_modal.showModal()}
            >
              <User />
            </button>
          </div>
          <button
            className="btn btn-square btn-ghost"
            onClick={() => window.key_modal.showModal()}
          >
            <Lock />
          </button>
          <input
            className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
            placeholder="your secrect..."
          />
          <button className="btn btn-square btn-ghost" onClick={handleSend}>
            <Send />
          </button>
        </div>
      </div>
      {showScrollButton && (
        <button
          className="absolute bottom-24 right-10 btn btn-secondary btn-circle"
          onClick={scrollToBottom}
        >
          <ArrowSmallDown />
        </button>
      )}
      <dialog id="user_modal" className="modal">
        <div className="modal-box flex flex-col gap-5">
          <h3 className="text-lg">How can we call you?</h3>
          <div className="flex flex-col items-end gap-1">
            <input
              className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
              placeholder="your name..."
              value={inputName}
              onChange={handleChangeName}
            />
            <p className="text-sm">{inputName.length}/10</p>
          </div>
          <form method="dialog" className="modal-action m-0">
            <button className="btn btn-ghost" onClick={handleSaveName}>
              Save
            </button>
          </form>
        </div>
      </dialog>
      <dialog id="key_modal" className="modal">
        <div className="modal-box flex flex-col gap-5">
          <h3 className="text-lg">Set your secrect key.</h3>
          <div className="flex flex-col items-end gap-1">
            <div className="w-full">
              <div className="flex gap-1">
                <input
                  className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
                  type={show ? "text" : "password"}
                  placeholder="your key..."
                  value={inputKey}
                  onChange={handleChangeKey}
                />
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => setShow(!show)}
                >
                  {show ? <Eye /> : <EyeSlash />}
                </button>
              </div>
            </div>
            <p className="text-sm">{inputKey.length}/10</p>
          </div>
          <form method="dialog" className="modal-action m-0">
            <button className="btn btn-ghost" onClick={handleSaveKey}>
              Save
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Home;
