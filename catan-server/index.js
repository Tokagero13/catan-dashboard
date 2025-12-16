import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const UPLOADS_DIR = 'uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const db = new sqlite3.Database('catan.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the catan.db database.');
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// --- DB INIT ---
db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT,
    players TEXT,
    last_updated TEXT
  );
  `);
  db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    group_id TEXT,
    session_name TEXT,
    created_date TEXT,
    num_players INTEGER,
    players_list TEXT,
    winner TEXT,
    notes TEXT,
    score_breakdown TEXT,
    dice_stats TEXT,
    winner_photo TEXT
  );
  `);
});

// --- GROUPS ---
app.get('/groups', (req, res) => {
  db.all('SELECT * FROM groups', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    rows.forEach(g => g.players = JSON.parse(g.players));
    res.json(rows);
  });
});

app.post('/groups', (req, res) => {
  const { id, name, players, lastUpdated } = req.body;
  db.run('INSERT OR REPLACE INTO groups (id, name, players, last_updated) VALUES (?, ?, ?, ?)',
    [id, name, JSON.stringify(players), lastUpdated],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ ok: true, id: this.lastID });
    }
  );
});

app.put('/groups/:id', (req, res) => {
    const { name, players } = req.body;
    const lastUpdated = new Date().toISOString();
    db.run('UPDATE groups SET name = ?, players = ?, last_updated = ? WHERE id = ?',
        [name, JSON.stringify(players), lastUpdated, req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ ok: true });
        }
    );
});

app.delete('/groups/:id', (req, res) => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('DELETE FROM sessions WHERE group_id = ?', [req.params.id]);
        db.run('DELETE FROM groups WHERE id = ?', [req.params.id], (err) => {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ error: err.message });
                return;
            }
            db.run('COMMIT');
            res.json({ ok: true });
        });
    });
});


// --- SESSIONS ---
app.get('/sessions', (req, res) => {
  db.all('SELECT * FROM sessions', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    rows.forEach(s => {
      s.players_list = JSON.parse(s.players_list);
      s.scoreBreakdown = JSON.parse(s.score_breakdown);
      s.diceStats = JSON.parse(s.dice_stats);
      if (s.winner_photo) {
        // Replace backslashes with forward slashes for URL compatibility
        const photoPath = s.winner_photo.replace(/\\/g, '/');
        s.winnerPhoto = `${serverUrl}/${photoPath}`;
      }
    });
    res.json(rows);
  });
});

app.post('/sessions', (req, res) => {
  const s = req.body;
  let winnerPhotoPath = null;

  if (s.winnerPhoto) {
    try {
      const base64Data = s.winnerPhoto.replace(/^data:image\/[a-z]+;base64,/, "");
      const photoName = `winner-${s.id}.png`;
      winnerPhotoPath = path.join(UPLOADS_DIR, photoName);
      fs.writeFileSync(winnerPhotoPath, base64Data, 'base64');
    } catch (error) {
      console.error("Failed to save winner photo:", error);
      // Decide if you want to fail the whole request or just proceed without the photo
      return res.status(500).json({ error: 'Failed to save winner photo.' });
    }
  }

  db.run(`INSERT INTO sessions (id, group_id, session_name, created_date, num_players, players_list, winner, notes, score_breakdown, dice_stats, winner_photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.id, s.groupId, s.session_name, s.created_date, s.num_players, JSON.stringify(s.players_list), s.winner, s.notes, JSON.stringify(s.scoreBreakdown), JSON.stringify(s.diceStats), winnerPhotoPath],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ ok: true, id: this.lastID });
    }
  );
});

app.put('/sessions/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    
    const allowedFields = ['session_name', 'winner', 'notes', 'score_breakdown', 'dice_stats', 'winner_photo'];
    const updates = [];
    const values = [];

    // Handle photo update separately
    if (fields.winner_photo) {
        try {
            const base64Data = fields.winner_photo.replace(/^data:image\/[a-z]+;base64,/, "");
            const photoName = `winner-${id}.png`;
            const winnerPhotoPath = path.join(UPLOADS_DIR, photoName);
            fs.writeFileSync(winnerPhotoPath, base64Data, 'base64');
            fields.winner_photo = winnerPhotoPath;
        } catch (error) {
            console.error("Failed to update winner photo:", error);
            return res.status(500).json({ error: 'Failed to update winner photo.' });
        }
    }


    for (const field in fields) {
        if (allowedFields.includes(field)) {
            updates.push(`${field} = ?`);
            const value = (field === 'score_breakdown' || field === 'dice_stats') ? JSON.stringify(fields[field]) : fields[field];
            values.push(value);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const stmt = `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`;
    db.run(stmt, values, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ ok: true });
    });
});

app.delete('/sessions/:id', (req, res) => {
    const { id } = req.params;
    // First, get the photo path
    db.get('SELECT winner_photo FROM sessions WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row && row.winner_photo && fs.existsSync(row.winner_photo)) {
            fs.unlinkSync(row.winner_photo);
        }

        // Then, delete the DB record
        db.run('DELETE FROM sessions WHERE id = ?', id, function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ ok: true });
        });
    });
});

// --- LEADERBOARD ---
app.get('/leaderboard', (req, res) => {
    db.all('SELECT * FROM sessions', [], (err, sessions) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        sessions.forEach(s => {
            s.players_list = JSON.parse(s.players_list || '[]');
        });

        const statsMap = {};

        sessions.forEach((session) => {
            const winner = session.winner.trim();
            if (!statsMap[winner]) statsMap[winner] = { wins: 0, total: 0, maxStreak: 0 };
            statsMap[winner].wins += 1;
            session.players_list.forEach((p) => {
                const player = p.trim();
                if (!player) return;
                if (!statsMap[player]) statsMap[player] = { wins: 0, total: 0, maxStreak: 0 };
                statsMap[player].total += 1;
            });
        });

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const sortedSessions = [...sessions].sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));

        Object.keys(statsMap).forEach(player => {
            let currentStreak = 0;
            let maxStreak = 0;
            sortedSessions.forEach(session => {
                const sessionTime = parseInt(session.id) || 0;
                if (sessionTime < thirtyDaysAgo) return;
                if (session.players_list.includes(player)) {
                    if (session.winner === player) {
                        currentStreak++;
                        if (currentStreak > maxStreak) maxStreak = currentStreak;
                    } else {
                        currentStreak = 0;
                    }
                }
            });
            statsMap[player].maxStreak = maxStreak;
        });

        const leaderboard = Object.entries(statsMap).map(([name, stat]) => ({
            name,
            wins: stat.wins,
            totalGames: stat.total,
            winRate: stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0,
            maxStreak: stat.maxStreak
        }));

        leaderboard.sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.winRate - a.winRate;
        });

        res.json(leaderboard);
    });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Catan API server running on port ${PORT}`);
});
