CREATE TABLE users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    password_hash text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE documents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    original_filename text not null,
    document_type text,
    mime_type text,
    file_size integer,
    file_url text not null,
    status text not null default 'uploaded',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE document_results (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    classification text,
    confidence numeric,
    extracted_data jsonb,
    validation_status text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE document_insights (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    insight_type text,
    insight_text text,
    severity text,
    created_at timestamptz default now()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_document_results_document_id ON document_results(document_id);
CREATE INDEX idx_document_insights_document_id ON document_insights(document_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_insights ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically. By enabling RLS and adding no explicit policies,
-- we effectively block anon/public access entirely.
