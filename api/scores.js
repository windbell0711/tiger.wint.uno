// api/scores.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const rows = await sql`
                SELECT id, name, jaccount, score1, score2, score3,
                       (score1 + score2 + score3) AS total
                FROM tiger
                ORDER BY total DESC, id ASC
                LIMIT ${limit}
            `;
            res.status(200).json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        const { name, jaccount, score1, score2, score3 } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: '姓名不能为空' });
        }
        if (!Number.isInteger(score1) || !Number.isInteger(score2) || !Number.isInteger(score3) ||
            score1 < 0 || score1 > 100 || score2 < 0 || score2 > 100 || score3 < 0 || score3 > 100) {
            return res.status(400).json({ error: '分数必须为0-100的整数' });
        }
        try {
            const row = await sql`
                INSERT INTO tiger (name, jaccount, score1, score2, score3)
                VALUES (${name.trim()}, ${jaccount || ''}, ${score1}, ${score2}, ${score3})
                RETURNING id, name, jaccount, score1, score2, score3,
                          (score1 + score2 + score3) AS total
            `;
            res.status(201).json(row[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}