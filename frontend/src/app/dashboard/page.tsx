"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getEmails, getPriorityEmails, getAccounts, syncAccount } from "@/lib/api";
import type { EmailWithAnalysis, EmailAccount } from "@/lib/types";
import EmailList from "@/components/EmailList";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const isPriorityView = searchParams.get("priority") === "high";

  const [emails, setEmails] = useState<EmailWithAnalysis[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [accountsData, emailsData] = await Promise.all([
        getAccounts(),
        isPriorityView ? getPriorityEmails(60) : getEmails({ limit: 50 }),
      ]);
      setAccounts(accountsData);
      setEmails(emailsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isPriorityView]);

  const handleSync = async () => {
    if (accounts.length === 0) return;
    setSyncing(true);
    try {
      for (const account of accounts) {
        await syncAccount(account.id);
      }
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="max-w-sm mx-auto text-center py-20 animate-fadeIn">
        <h2 className="text-lg font-medium text-gray-900 mb-2">No accounts connected</h2>
        <p className="text-sm text-gray-500 mb-6">
          Connect your Gmail to start seeing prioritized emails.
        </p>
        <a
          href="/dashboard/accounts"
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          Connect Gmail
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            {isPriorityView ? "Priority" : "Inbox"}
          </h1>
          <p className="text-sm text-gray-500">
            {emails.length} emails
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {syncing ? "Syncing..." : "Sync"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      <EmailList emails={emails} onRefresh={fetchData} />
    </div>
  );
}
