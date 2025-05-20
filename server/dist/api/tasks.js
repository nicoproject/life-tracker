"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// Получить все задачи (Read)
router.get('/', async (req, res) => {
    const [tasks] = await index_1.pool.query('SELECT * FROM tasks');
    res.json(tasks);
});
// Создать задачу (Create)
router.post('/', async (req, res) => {
    const { title, status } = req.body;
    const [result] = await index_1.pool.query('INSERT INTO tasks (title, status) VALUES (?, ?)', [title, status || 'Не начато']);
    res.status(201).json({ id: result.insertId, title, status });
});
// Обновить задачу (Update)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
    await index_1.pool.query('UPDATE tasks SET title = ?, status = ? WHERE id = ?', [
        title,
        status,
        id,
    ]);
    res.json({ id, title, status });
});
// Удалить задачу (Delete)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await index_1.pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.status(204).send();
});
exports.default = router;
