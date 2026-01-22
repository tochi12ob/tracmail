"use client";

import { useEffect, useState } from "react";
import { getPreferences, updatePreferences } from "@/lib/api";
import type { UserPreferences } from "@/lib/types";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      setPreferences(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updatePreferences({
        vip_contacts: preferences.vip_contacts,
        vip_domains: preferences.vip_domains,
      });
      setSuccess("Saved");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    if (!newContact || !preferences) return;
    if (!preferences.vip_contacts.includes(newContact)) {
      setPreferences({
        ...preferences,
        vip_contacts: [...preferences.vip_contacts, newContact],
      });
    }
    setNewContact("");
  };

  const removeContact = (contact: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      vip_contacts: preferences.vip_contacts.filter((c) => c !== contact),
    });
  };

  const addDomain = () => {
    if (!newDomain || !preferences) return;
    const domain = newDomain.replace(/^@/, "").toLowerCase();
    if (!preferences.vip_domains.includes(domain)) {
      setPreferences({
        ...preferences,
        vip_domains: [...preferences.vip_domains, domain],
      });
    }
    setNewDomain("");
  };

  const removeDomain = (domain: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      vip_domains: preferences.vip_domains.filter((d) => d !== domain),
    });
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
      <h1 className="text-lg font-medium text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Configure priority preferences</p>

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

      {preferences && (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-3">VIP Contacts</h2>
            <p className="text-xs text-gray-500 mb-3">Emails from these addresses get higher priority</p>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContact()}
                placeholder="email@example.com"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all duration-200 hover:border-gray-300"
              />
              <button
                onClick={addContact}
                className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.vip_contacts.map((contact) => (
                <span
                  key={contact}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs animate-scaleIn transition-all duration-200 hover:bg-gray-200"
                >
                  {contact}
                  <button onClick={() => removeContact(contact)} className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                    ×
                  </button>
                </span>
              ))}
              {preferences.vip_contacts.length === 0 && (
                <span className="text-xs text-gray-400">None added</span>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-3">VIP Domains</h2>
            <p className="text-xs text-gray-500 mb-3">Emails from these domains get higher priority</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
                placeholder="company.com"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all duration-200 hover:border-gray-300"
              />
              <button
                onClick={addDomain}
                className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.vip_domains.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs animate-scaleIn transition-all duration-200 hover:bg-gray-200"
                >
                  @{domain}
                  <button onClick={() => removeDomain(domain)} className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                    ×
                  </button>
                </span>
              ))}
              {preferences.vip_domains.length === 0 && (
                <span className="text-xs text-gray-400">None added</span>
              )}
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
