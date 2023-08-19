-- Create the 'account_holder' table
CREATE TABLE account_holder (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

-- Create the 'account' table
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES account_holder(user_id),
    account_number VARCHAR(20) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0
);

-- Insert users into 'account_holder' table
INSERT INTO account_holder (username, email, password)
VALUES
    ('john_doe', 'john@example.com', 'password123'),
    ('jane_smith', 'jane@example.com', 'securepass');

-- Insert accounts into 'account' table
INSERT INTO account (user_id, account_number, balance)
VALUES
    (1, 'A123456', 1500.00),
    (2, 'B901234', 3500.00);
