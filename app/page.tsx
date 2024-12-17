"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = useState<
    {
      id: number;
      text: string;
      type: "user" | "ai";
    }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      type: "user" as const,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputValue }),
      });

      // Create AI message placeholder
      const aiMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          text: "",
          type: "ai",
        },
      ]);

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = (await reader?.read()) || {};
        if (done) break;

        const decodedChunk = decoder.decode(value);
        fullResponse += decodedChunk;

        // Update the last AI message with streaming content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "An error occurred. Please try again.",
          type: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-100">
      <div className="flex flex-col h-screen max-w-4xl m-auto bg-gray-100">
        {/* Chat Header */}
        <div className="p-4 text-center">
          <h1 className="text-xl font-semibold text-gray-800">
            AI Chat Assistant
          </h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}>
              {message.type === "ai" && (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              <div
                className={`
                max-w-[70%] p-3 rounded-xl 
                ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 border"
                }
                `}>
                {message.text}
              </div>
              {message.type === "user" && (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow text-gray-500 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="
          bg-blue-500 text-white p-2 rounded-full 
          hover:bg-blue-600 transition-colors
          disabled:bg-gray-300 disabled:cursor-not-allowed
          ">
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
