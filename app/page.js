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
import ArrowSmallDown from "./components/icon/arrowSmallDown";
import Key from "./components/icon/key";
import { generateKeys } from "./rsa";
import ArrowUpDown from "./components/icon/arrowUpDown";
import Clipboard from "./components/icon/clipboard";
import UnLock from "./components/icon/unLock";

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

  return <time className="text-xs">{timeAgo(prevDate)}</time>;
};

const MessageItem = ({ item, setCurrentMessage }) => {
  return (
    <div key={item.id} className="chat chat-start items-end">
      <div className="chat-image avatar placeholder">
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
          {item.message.split(" ").join(" ")}
          <div className="text-right opacity-50">
            {`${item.createBy} • `}
            <TimeAgo prevDate={item.createAt.toDate()} />
          </div>
        </div>
        <button
          className="btn btn-circle btn-ghost"
          onClick={() => {
            window.secrect_modal.showModal(), setCurrentMessage();
          }}
        >
          <Lock />
        </button>
      </div>
    </div>
  );
};

const KeyItem = ({ index, item }) => {
  const [isCopy, setIsCopy] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 3000);
  };
  return (
    <div className="flex gap-1 items-center">
      <div className="flex flex-1">
        <span className="opacity-50 mr-1">Message{index + 1}:</span> {item.key}
      </div>
      <div className={isCopy ? "tooltip tooltip-open" : ""} data-tip="Copied">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => handleCopy(item.key)}
        >
          <Clipboard />
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
  const [history, setHistory] = useState([]);
  const [inputUnlock, setInputUnlock] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isEmptyName, setIsEmptyName] = useState(false);
  const [isEmptyMessage, setIsEmptyMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendLoading, SetIsSendLoading] = useState(false);
  const [isMessageOver, setIsMessageOVer] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("currentName");

    if (storedName) {
      setInputName(storedName);
    }
  }, []);

  useEffect(() => {
    const users = localStorage.getItem("users");
    const userObjects = JSON.parse(users);
    const currentUserObject = userObjects?.find(
      (user) => user.username === inputName
    );

    if (currentUserObject) {
      setHistory(currentUserObject.history);
    } else {
      setHistory([]);
    }
  }, [inputName]);

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
    setInputName(event.target.value.substring(0, 16));
  };

  const handleMessageChange = (event) => {
    setInputMessage(event.target.value.substring(0, 500));
    if (inputMessage.length == 500) {
      setIsMessageOVer(true);
      setTimeout(() => setIsMessageOVer(false), 3000);
    }
  };

  const handleUnlockChange = (event) => {
    setInputUnlock(event.target.value.substring(0, 6));
  };

  const handleSaveName = () => {
    localStorage.setItem("currentName", inputName);
  };

  const handleSaveKey = (key) => {
    const userString = localStorage.getItem("users");
    let userObjects = userString ? JSON.parse(userString) : [];
    const currentUserObject = userObjects.find(
      (user) => user.username === inputName
    );

    if (currentUserObject) {
      currentUserObject.history.push({ key });
    } else {
      userObjects = [
        ...userObjects,
        { username: inputName, history: [{ key }] },
      ];
    }
    localStorage.setItem("users", JSON.stringify(userObjects));
    setHistory([...history, { key }]);
  };

  const handleSend = async () => {
    if (inputName.trim() === "" || inputName === null) {
      setIsEmptyName(true);
      setTimeout(() => setIsEmptyName(false), 3000);
      return;
    }

    if (inputMessage.trim() === "") {
      setIsEmptyMessage(true);
      setTimeout(() => setIsEmptyMessage(false), 3000);
      return;
    }

    SetIsSendLoading(true);
    const keys = generateKeys();

    try {
      const encryptedMessage = await new Promise((resolve, reject) => {
        const worker = new Worker("/encryptionWorker.js");

        worker.onmessage = function (e) {
          const encryptedResult = e.data;
          resolve(encryptedResult);
        };

        worker.onerror = function (error) {
          reject(error);
        };

        worker.postMessage({
          message: inputMessage,
          publicKey: keys.publicKey,
        });
      });

      await addDoc(collection(db, "messages"), {
        message: encryptedMessage,
        n: keys.publicKey.N,
        createBy: inputName,
        createAt: Timestamp.now(),
      });
    } catch (e) {
      console.error(e);
      return;
    } finally {
      SetIsSendLoading(false);
    }

    handleSaveKey(keys.privateKey.d);
    setInputMessage("");
  };

  const handleMessage = () => {
    if (!currentMessage || inputUnlock === "") {
      setMessage("");
      return;
    }

    setIsLoading(true);
    const worker = new Worker("/decryptionWorker.js");

    worker.onmessage = function (e) {
      const decryptedMessage = e.data;
      setMessage(decryptedMessage);
      setIsLoading(false);
    };

    worker.postMessage({
      encryptedMessage: currentMessage.message,
      privateKey: {
        N: currentMessage.n,
        d: inputUnlock,
      },
    });
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
            <MessageItem
              key={item.id}
              item={item}
              setCurrentMessage={() =>
                setCurrentMessage({
                  message: item.message,
                  n: item.n,
                })
              }
            />
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
          <button
            className="btn btn-square btn-ghost"
            onClick={() => window.key_modal.showModal()}
          >
            <Key />
          </button>
          <div
            className={`w-full ${
              isEmptyMessage && "tooltip tooltip-secondary tooltip-open"
            }`}
            data-tip="What's message you want to send!"
          >
            <div
              className={`w-full ${
                isMessageOver && "tooltip tooltip-secondary tooltip-open"
              }`}
              data-tip="Your message is over 500 characters!"
            >
              <input
                className="input focus:outline-0 text-lg w-full bg-[#A6ADBA] bg-opacity-20"
                placeholder="your secret..."
                value={inputMessage}
                onChange={handleMessageChange}
              />
            </div>
          </div>
          {isSendLoading ? (
            <button className="btn btn-square btn-ghost btn-disabled">
              <span className="loading loading-dots loading-sm" />
            </button>
          ) : (
            <button className="btn btn-square btn-ghost" onClick={handleSend}>
              <Send />
            </button>
          )}
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
            <p className="text-sm">{inputName.length}/16</p>
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
          <h3 className="text-lg">Your secret key.</h3>
          <div className="flex flex-col items-end gap-1">
            <div className="w-full">
              <div className="flex flex-col gap-2">
                {history.length == 0
                  ? "Don't have any keys yet!"
                  : history.map((item, index) => {
                      return <KeyItem key={index} index={index} item={item} />;
                    })}
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-action m-0">
            <button className="btn btn-ghost">Close</button>
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
              type="number"
              placeholder="your key..."
              onChange={handleUnlockChange}
              value={inputUnlock}
            />
            <button
              className="btn btn-square btn-ghost"
              onClick={handleMessage}
            >
              <UnLock />
            </button>
          </div>
          <div className="w-full flex flex-col items-center gap-5">
            <ArrowUpDown />
            {isLoading ? (
              <span className="loading loading-dots loading-sm" />
            ) : (
              <p>{message == "" ? "Please enter the secrect key!" : message}</p>
            )}
          </div>

          <form method="dialog" className="modal-action m-0">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setMessage(""), setInputUnlock("");
              }}
            >
              Close
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setMessage(""), setInputUnlock("");
            }}
          />
        </form>
      </dialog>
    </div>
  );
};

export default Home;
