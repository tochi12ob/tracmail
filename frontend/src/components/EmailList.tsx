"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import type { EmailWithAnalysis } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";
import EmailDetail from "./EmailDetail";

interface EmailListProps {
  emails: EmailWithAnalysis[];
  onRefresh?: () => void;
}

export default function EmailList({ emails, onRefresh }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailWithAnalysis | null>(null);

  if (emails.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No emails yet</p>
      </div>
    );
  }

  const getPriorityBorder = (score: number | undefined) => {
    if (!score) return "";
    if (score >= 80) return "border-l-[3px] border-l-red-500";
    if (score >= 60) return "border-l-[3px] border-l-orange-500";
    if (score >= 40) return "border-l-[3px] border-l-yellow-500";
    if (score >= 20) return "border-l-[3px] border-l-green-500";
    return "";
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex gap-6">
      {/* List */}
      <div className={clsx(
        "bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 animate-slideUp",
        selectedEmail ? "w-[400px] flex-shrink-0" : "w-full"
      )}>
        {emails.map((email, index) => (
          <button
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            style={{ animationDelay: `${index * 0.03}s` }}
            className={clsx(
              "w-full text-left p-4 transition-all duration-200 hover:bg-gray-50 hover:pl-5 group",
              selectedEmail?.id === email.id && "bg-gray-50",
              getPriorityBorder(email.analysis?.priority_score)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <span className="text-xs font-medium text-gray-600">
                  {getInitials(email.sender_name, email.sender_email)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={clsx(
                    "text-sm truncate",
                    !email.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                  )}>
                    {email.sender_name || email.sender_email}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                  </span>
                </div>
                <p className={clsx(
                  "text-sm truncate mb-0.5",
                  !email.is_read ? "text-gray-900" : "text-gray-600"
                )}>
                  {email.subject}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-400 truncate">{email.snippet}</p>
                  {email.analysis && (
                    <PriorityBadge score={email.analysis.priority_score} />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail */}
      {selectedEmail && (
        <div className="flex-1 min-w-0">
          <EmailDetail
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            onFeedback={onRefresh}
          />
        </div>
      )}
    </div>
  );
}
