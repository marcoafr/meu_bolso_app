-- Criar a tabela users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type INTEGER NOT NULL DEFAULT 1 CHECK (type IN (0, 1)), -- 0 - admin, 1 - user
    status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0 - active, 1 - inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type INTEGER NOT NULL CHECK (type IN (0, 1)), -- 0 - receipt, 1 - expense
    user_id BIGINT NOT NULL REFERENCES users(id),
    status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0 - active, 1 - inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela category_budgets
CREATE TABLE category_budgets (
    id BIGSERIAL PRIMARY KEY,
    amount NUMERIC(11, 2) NOT NULL,
    status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0 - active, 1 - inactive
    category_id BIGINT NOT NULL REFERENCES categories(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela bank_accounts
CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color CHAR(7) CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    initial_amount NUMERIC(11, 2) DEFAULT 0,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0 - active, 1 - inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela credit_cards
CREATE TABLE credit_cards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Cor no formato hexadecimal (#RRGGBB)
    closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 0 AND 31),
    paying_day INTEGER NOT NULL CHECK (paying_day BETWEEN 0 AND 31),
    user_id BIGINT NOT NULL REFERENCES users(id),
    status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1)), -- 0 - active, 1 - inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela transactions
CREATE TABLE transactions ( 
    id BIGSERIAL PRIMARY KEY, 
    total_amount NUMERIC(11, 2) NOT NULL, 
    issue_date DATE NOT NULL, 
    status INTEGER DEFAULT 0 NOT NULL CHECK (status IN (0, 1, 2, 3, 4)), -- 0 - Pending, 1 - Paid, 2 - Partially Paid, 3 - Canceled, 4 - Deleted;
    category_id BIGINT NOT NULL REFERENCES categories(id), 
    credit_card_id BIGINT REFERENCES credit_cards(id), 
    user_id BIGINT NOT NULL REFERENCES users(id), 
    correlation_id VARCHAR(255), 
    description VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- Criar a tabela receivables
CREATE TABLE receivables ( 
    id BIGSERIAL PRIMARY KEY, 
    total_amount NUMERIC(11, 2) NOT NULL, 
    discount_amount NUMERIC(11, 2) DEFAULT 0, 
    tax_amount NUMERIC(11, 2) DEFAULT 0, 
    paid_amount NUMERIC(11, 2) DEFAULT 0, 
    competence_date DATE NOT NULL, 
    card_competence_date DATE NOT NULL, 
    status INTEGER NOT NULL CHECK (status IN (0, 1, 3, 4)), -- 0 - Pending, 1 - Paid, 3 - Canceled, 4 - Deleted;
    transaction_id BIGINT NOT NULL REFERENCES transactions(id), 
    user_id BIGINT NOT NULL REFERENCES users(id),
    bank_account_id BIGINT REFERENCES bank_accounts(id),
    payment_date DATE, 
    metadata JSONB DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- Inserir usuário inicial
INSERT INTO users (name, email, login, password, type)
VALUES ('Marco', 'marcoafr@live.com', '21232f297a57a5a743894a0e4a801fc3', 'e3274be5c857fb42ab72d786e281b4b8', 0);

-- Inserir categoria inicial vinculada ao último ID de usuário gerado
INSERT INTO categories (name, type, user_id)
VALUES ('Salário', 0, currval(pg_get_serial_sequence('users', 'id')));

INSERT INTO categories (name, type, user_id)
VALUES ('Supermercado', 1, currval(pg_get_serial_sequence('users', 'id')));

-- Inserir orçamento de categoria inicial vinculado à categoria criada
INSERT INTO category_budgets (amount, category_id, user_id)
VALUES (500, currval(pg_get_serial_sequence('categories', 'id')), currval(pg_get_serial_sequence('users', 'id')));

-- Inserir conta bancária inicial
INSERT INTO bank_accounts (name, color, initial_amount, user_id)
VALUES ('Inter', '#E66B19', 1500, currval(pg_get_serial_sequence('users', 'id')));

INSERT INTO bank_accounts (name, color, initial_amount, user_id)
VALUES ('NuBank', '#A020F0', 1000, currval(pg_get_serial_sequence('users', 'id')));

INSERT INTO bank_accounts (name, color, initial_amount, user_id)
VALUES ('Caixa', '#1D33AD', 520.23, currval(pg_get_serial_sequence('users', 'id')));

INSERT INTO bank_accounts (name, color, initial_amount, user_id)
VALUES ('Santander', '#DE1D1D', 70.49, currval(pg_get_serial_sequence('users', 'id')));

-- Inserir cartão de crédito inicial
INSERT INTO credit_cards (name, color, closing_day, paying_day, user_id)
VALUES ('C6 Bank', '#A8A2AB', 24, 1, currval(pg_get_serial_sequence('users', 'id')));

-- Inserir transação única
INSERT INTO transactions (total_amount, description, issue_date, category_id, user_id, credit_card_id, status)
VALUES (200, 'Compras CenterBox', '2024-12-01', currval(pg_get_serial_sequence('categories', 'id')), currval(pg_get_serial_sequence('users', 'id')), currval(pg_get_serial_sequence('credit_cards', 'id')), 0);

-- Inserir receivables
INSERT INTO receivables (total_amount, paid_amount, status, transaction_id, competence_date, card_competence_date, bank_account_id, user_id, metadata)
VALUES (66.67, 66.67, 1, currval(pg_get_serial_sequence('transactions', 'id')), '2024-12-01', '2024-12-01', currval(pg_get_serial_sequence('bank_accounts', 'id')), currval(pg_get_serial_sequence('users', 'id')), '{"installment": 1, "total_installments": 3}');
INSERT INTO receivables (total_amount, status, transaction_id, competence_date, card_competence_date, user_id, metadata)
VALUES (66.66, 0, currval(pg_get_serial_sequence('transactions', 'id')), '2025-01-01', '2025-01-01', currval(pg_get_serial_sequence('users', 'id')), '{"installment": 2, "total_installments": 3}');
INSERT INTO receivables (total_amount, status, transaction_id, competence_date, card_competence_date, user_id, metadata)
VALUES (66.66, 0, currval(pg_get_serial_sequence('transactions', 'id')), '2025-02-01', '2025-02-01', currval(pg_get_serial_sequence('users', 'id')), '{"installment": 3, "total_installments": 3}');