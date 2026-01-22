"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { EmailWithAnalysis } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import { submitFeedback } from "@/lib/api";

interface EmailDetailProps {
  email: EmailWithAnalysis;
  onClose: () => void;
  onFeedback?: () => void;
}

export default function EmailDetail({ email, onClose, onFeedback }: EmailDetailProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleFeedback = async (isCorrect: boolean) => {
    try {
      await submitFeedback(email.id, isCorrect);
      setFeedbackGiven(true);
      onFeedback?.();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const getInitials = (name: string | null, emailAddr: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return emailAddr.slice(0, 2).toUpperCase();
  };

  const analysis = email.analysis;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6 animate-slideIn">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 animate-fadeIn">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 leading-snug">{email.subject}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {getInitials(email.sender_name, email.sender_email)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {email.sender_name || email.sender_email}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(email.received_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis */}
      {analysis && (
        <div className="p-5 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Analysis</span>
            <PriorityBadge score={analysis.priority_score} />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{analysis.explanation}</p>

          {analysis.action_items.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Action items</p>
              <ul className="space-y-1.5">
                {analysis.action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!feedbackGiven ? (
            <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">Is this accurate?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 pt-3 border-t border-gray-200">
              Thanks for your feedback
            </p>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-5 max-h-[400px] overflow-y-auto">
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {email.body_text || email.snippet}
        </div>
      </div>
    </div>
  );
}
