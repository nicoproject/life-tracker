-- Создание базы данных (безопасно, если уже существует)
CREATE DATABASE IF NOT EXISTS life_tracker 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE life_tracker;

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
