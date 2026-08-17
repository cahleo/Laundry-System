-- Laundry Management System — MySQL schema for XAMPP
-- Import this via phpMyAdmin (SQL tab) or: mysql -u root -p < db.sql

CREATE DATABASE IF NOT EXISTS laundry_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laundry_db;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE service_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(160) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_customers_search (full_name, phone, email)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_id VARCHAR(12) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  service_type_id INT NOT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('received','sorting','washing','drying','folding','ready_for_pickup','picked_up') NOT NULL DEFAULT 'received',
  estimated_finish DATETIME NULL,
  notes TEXT NULL,
  picked_up_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_tracking (tracking_id)
) ENGINE=InnoDB;

CREATE TABLE order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  previous_status VARCHAR(30) NULL,
  new_status VARCHAR(30) NOT NULL,
  changed_by INT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE notification_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  event ENUM('order_created','ready_for_pickup') NOT NULL,
  recipient_email VARCHAR(160) NULL,
  status ENUM('sent','failed') NOT NULL,
  error_message TEXT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Starter service catalog — edit prices to match your shop
INSERT INTO service_types (name, price_per_kg, is_active) VALUES
('Wash & Fold', 60.00, 1),
('Dry Clean', 150.00, 1),
('Delicate Wash', 90.00, 1),
('Bedding & Linens', 70.00, 1),
('Express Same-Day', 120.00, 0);

-- No admin account or customers/orders are seeded — create your first
-- admin via api/signup.php (see README.md) once the server is running.
