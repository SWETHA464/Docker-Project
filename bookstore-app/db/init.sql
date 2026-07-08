-- Bookstore Ordering & Analytics Platform - Database Schema

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  author VARCHAR(100) NOT NULL DEFAULT '',
  description VARCHAR(255),
  category ENUM('Fiction', 'Non-Fiction') NOT NULL DEFAULT 'Fiction',
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  book_id INT NOT NULL,
  book_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Helpful indexes for analytics queries
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);

-- Seed catalog data
INSERT INTO books (name, author, description, category, price, image_url, is_available) VALUES
('The Midnight Library', 'Matt Haig', 'A dazzling novel about all the choices that go into a life well lived', 'Fiction', 399.00, '', TRUE),
('Fourth Wing', 'Rebecca Yarros', 'A gripping tale of dragons, war college, and impossible odds', 'Fiction', 449.00, '', TRUE),
('The Silent Patient', 'Alex Michaelides', 'A shocking psychological thriller of a woman''s act of violence', 'Fiction', 349.00, '', TRUE),
('Lessons in Chemistry', 'Bonnie Garmus', 'A witty, uplifting story of a scientist turned reluctant TV chef', 'Fiction', 379.00, '', TRUE),
('Sapiens', 'Yuval Noah Harari', 'A brief history of humankind, from the Stone Age to the present', 'Non-Fiction', 499.00, '', TRUE),
('Atomic Habits', 'James Clear', 'An easy and proven way to build good habits and break bad ones', 'Non-Fiction', 429.00, '', TRUE),
('Educated', 'Tara Westover', 'A memoir about the transformative power of education', 'Non-Fiction', 399.00, '', TRUE),
('Outlive', 'Peter Attia', 'The science and art of longevity, health, and living well', 'Non-Fiction', 459.00, '', TRUE);

-- Note: the default admin account (username/password from ADMIN_DEFAULT_USERNAME /
-- ADMIN_DEFAULT_PASSWORD env vars) is created automatically by the backend on
-- startup with a bcrypt-hashed password -- see backend/server.js -> seedAdmin().
