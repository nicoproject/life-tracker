-- Создание базы данных (безопасно, если уже существует)
CREATE DATABASE IF NOT EXISTS life_tracker 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE life_tracker;

-- Таблица трекеров
CREATE TABLE IF NOT EXISTS trackers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('counter', 'progress', 'habit', 'measurement') NOT NULL,
    current_value INT DEFAULT 0,
    target_value INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Таблица записей трекеров
CREATE TABLE IF NOT EXISTS tracker_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracker_id INT NOT NULL,
    date DATE NOT NULL,
    entry_time TIME NOT NULL DEFAULT CURRENT_TIME,
    value DECIMAL(10,2) NOT NULL,
    status ENUM('success', 'failure', 'reset', 'measurement') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Основная таблица задач (с точными значениями из вашего работающего кода)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Не начато', 'В процессе', 'Завершено', 'Отложено') NOT NULL DEFAULT 'Не начато',
    priority ENUM('Низкий', 'Средний', 'Высокий', 'Критичный') NOT NULL DEFAULT 'Средний',
    due_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Оптимальные индексы для ускорения запросов
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tracker_entries_date ON tracker_entries(date);
CREATE INDEX idx_tracker_entries_status ON tracker_entries(status);
