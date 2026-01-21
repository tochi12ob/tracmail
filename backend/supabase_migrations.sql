-- Trackmail Database Schema
-- Run this in your Supabase SQL Editor

-- Email Accounts Table
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMPTZ NOT NULL,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email_address)
);

-- Emails Table
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    gmail_id TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    subject TEXT NOT NULL,
    snippet TEXT,
    body_text TEXT,
    received_at TIMESTAMPTZ NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    labels TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, gmail_id)
);

-- Email Analysis Table
CREATE TABLE IF NOT EXISTS email_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE UNIQUE,
    priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
    explanation TEXT NOT NULL,
    action_items JSONB DEFAULT '[]',
    urgency_factors JSONB DEFAULT '{}',
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    vip_contacts TEXT[] DEFAULT '{}',
    vip_domains TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emails_account_id ON emails(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_sender_email ON emails(sender_email);
CREATE INDEX IF NOT EXISTS idx_email_analysis_priority ON email_analysis(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts(user_id);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Email Accounts: Users can only access their own accounts
CREATE POLICY "Users can view own email accounts"
    ON email_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email accounts"
    ON email_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email accounts"
    ON email_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email accounts"
    ON email_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Emails: Users can access emails from their accounts
CREATE POLICY "Users can view emails from own accounts"
    ON emails FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert emails to own accounts"
    ON emails FOR INSERT
    WITH CHECK (
        account_id IN (
            SELECT id FROM email_accounts WHERE user_id = auth.uid()
        )
    );

-- Email Analysis: Users can access analysis for their emails
CREATE POLICY "Users can view analysis for own emails"
    ON email_analysis FOR SELECT
    USING (
        email_id IN (
            SELECT e.id FROM emails e
            JOIN email_accounts ea ON e.account_id = ea.id
            WHERE ea.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analysis for own emails"
    ON email_analysis FOR INSERT
    WITH CHECK (
        email_id IN (
            SELECT e.id FROM emails e
            JOIN email_accounts ea ON e.account_id = ea.id
            WHERE ea.user_id = auth.uid()
        )
    );

-- User Preferences: Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);
