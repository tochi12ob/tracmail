"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getAccounts, connectGmail, disconnectAccount, syncAccount } from "@/lib/api";
import type { EmailAccount } from "@/lib/types";

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "true";

  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAccounts();
    if (justConnected) setSuccess("Account connected");
  }, [justConnected]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { auth_url } = await connectGmail();
      window.location.href = auth_url;
    } catch (err: any) {
      setError(err.message);
      setConnecting(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Disconnect this account?")) return;
    try {
      await disconnectAccount(accountId);
      setAccounts(accounts.filter((a) => a.id !== accountId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md animate-fadeIn">
      <h1 className="text-lg font-medium text-gray-900 mb-1">Accounts</h1>
      <p className="text-sm text-gray-500 mb-6">Manage connected email accounts</p>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {accounts.map((account, index) => (
          <div
            key={account.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="bg-white p-3 rounded-lg border border-gray-100 flex items-center justify-between animate-slideUp transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{account.email_address}</p>
              <p className="text-xs text-gray-400">
                {account.last_sync_at
                  ? `Synced ${formatDistanceToNow(new Date(account.last_sync_at), { addSuffix: true })}`
                  : "Never synced"}
              </p>
            </div>
            <button
              onClick={() => handleDisconnect(account.id)}
              className="text-xs text-gray-400 hover:text-red-600 transition-all duration-200 hover:scale-105"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full p-3 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
      >
        {connecting ? "Connecting..." : "+ Connect Gmail"}
      </button>
    </div>
  );
}
