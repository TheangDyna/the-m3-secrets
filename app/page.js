"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import db from "../firebase";

import Lock from "./components/icon/lock";
import User from "./components/icon/user";
import Send from "./components/icon/send";
import Eye from "./components/icon/eye";
import ArrowSmallDown from "./components/icon/arrowSmallDown";
import EyeSlash from "./components/icon/eyeSlash";

const TimeAgo = ({ prevDate }) => {
  const timeAgo = (prevDate) => {
    const diff = Number(new Date()) - prevDate;
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;
    switch (true) {
      case diff < minute:
        return "just now";
      case diff < hour:
        return Math.round(diff / minute) + " minutes ago";
      case diff < day:
        return Math.round(diff / hour) + " hours ago";
      case diff < month:
        return Math.round(diff / day) + " days ago";
      case diff < year:
        return Math.round(diff / month) + " months ago";
      case diff > year:
        return Math.round(diff / year) + " years ago";
      default:
        return "";
    }
  };

  return <time className="text-xs opacity-50">{timeAgo(prevDate)}</time>;
};

const MessageItem = ({ item }) => {
  return (
    <div key={item.id} className="chat chat-start items-end">
      <div className="avatar placeholder">
        <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
          <span className="">
            {item.createBy.split(" ").length > 1
              ? item.createBy
                  .split(" ")
                  .slice(0, 2)
                  .map((item) => item.charAt(0))
                  .join("")
                  .toUpperCase()
              : item.createBy.substring(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="chat-bubble">
          {item.message}
          <div className="text-right">
            <TimeAgo prevDate={item.createAt.toDate()} />
          </div>
        </div>
        <button
          className="btn btn-circle btn-ghost"
          onClick={() => window.secrect_modal.showModal()}
        >
          <Lock />
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);
  const shouldFollowLastMessageRef = useRef(true);
  const [inputName, setInputName] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [inputUnlock, setInputUnlock] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [show, setShow] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isEmptyName, setIsEmptyName] = useState(false);
  const [isEmptyKey, setIsEmptyKey] = useState(false);
  const [isEmptyMessage, setIsEmptyMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedKey = localStorage.getItem("secretKey");
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
  }, [messages]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setMessages(itemsArr);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    setShowScrollButton(false);
  };

  const handleNameChange = (event) => {
    setInputName(event.target.value.substring(0, 10));
  };

  const handleKeyChange = (event) => {
    setInputKey(event.target.value.substring(0, 10));
  };

  const handleMessageChange = (event) => {
    setInputMessage(event.target.value);
  };

  const handleUnlockChange = (event) => {
    setInputUnlock(event.target.value);
  };

  const handleSaveName = () => {
    localStorage.setItem("userName", inputName);
  };

  const handleSaveKey = () => {
    localStorage.setItem("secretKey", inputKey);
  };

  const handleSend = async () => {
    if (inputName.trim() === "" || inputName === null) {
      setIsEmptyName(true);
      setTimeout(() => setIsEmptyName(false), 3000);
      return;
    }
    if (inputKey.trim() === "" || inputKey === null) {
      setIsEmptyKey(true);
      setTimeout(() => setIsEmptyKey(false), 3000);
      return;
    }
    if (inputMessage.trim() === "") {
      setIsEmptyMessage(true);
      setTimeout(() => setIsEmptyMessage(false), 3000);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "messages"), {
        message: inputMessage,
        createBy: inputName,
        createAt: Timestamp.now(),
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
      return;
    }

    setInputMessage("");
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex justify-center py-5 text-xl font-medium">
        The M3 Secrets
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
          {messages.map((item) => (
            <MessageItem key={item.id} item={item} />
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="w-[800px] py-3 flex items-center gap-1">
          <div
            className={
              isEmptyName ? "tooltip tooltip-secondary tooltip-open" : ""
            }
            data-tip="Who are you!"
          >
            <button
              className="btn btn-square btn-ghost"
              onClick={() => window.user_modal.showModal()}
            >
              <User />
            </button>
          </div>
          <div
            className={
              isEmptyKey ? "tooltip tooltip-secondary tooltip-open" : ""
            }
            data-tip="What's your secret key!"
          >
            <button
              className="btn btn-square btn-ghost"
              onClick={() => window.key_modal.showModal()}
            >
              <Lock />
            </button>
          </div>
          <div
            className={`w-full ${
              isEmptyMessage && "tooltip tooltip-secondary tooltip-open"
            }`}
            data-tip="What's message you want to send!"
          >
            <input
              className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
              placeholder="your secret..."
              value={inputMessage}
              onChange={handleMessageChange}
            />
          </div>
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
              onChange={handleNameChange}
            />
            <p className="text-sm">{inputName.length}/10</p>
          </div>
          <form method="dialog" className="modal-action m-0">
            <button className="btn btn-ghost" onClick={handleSaveName}>
              Save
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button />
        </form>
      </dialog>
      <dialog id="key_modal" className="modal">
        <div className="modal-box flex flex-col gap-5">
          <h3 className="text-lg">Set your secret key.</h3>
          <div className="flex flex-col items-end gap-1">
            <div className="w-full">
              <div className="flex gap-1">
                <input
                  className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
                  type={show ? "text" : "password"}
                  placeholder="your key..."
                  value={inputKey}
                  onChange={handleKeyChange}
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
        <form method="dialog" className="modal-backdrop">
          <button />
        </form>
      </dialog>
      <dialog id="secrect_modal" className="modal">
        <div className="modal-box flex flex-col gap-5">
          <h3 className="text-lg">The secret message.</h3>
          <div className="flex gap-1">
            <input
              autoFocus
              className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
              type={show ? "text" : "password"}
              placeholder="your key..."
              onChange={handleUnlockChange}
            />
            <button
              className="btn btn-square btn-ghost"
              onClick={() => setShowUnlock(!showUnlock)}
            >
              {showUnlock ? <Eye /> : <EyeSlash />}
            </button>
          </div>
          <div className="w-full flex flex-col gap-5">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button />
        </form>
      </dialog>
    </div>
  );
};

export default Home;
