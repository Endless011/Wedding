const pool = require('../db');

// Helper: Generate Friend Code
const generateFriendCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Register
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const title = 'Gelin Hanım';
        const friendCode = generateFriendCode();

        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' });
        }

        const newUser = await pool.query(
            'INSERT INTO users (username, password, title, friend_code) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, password, title, friendCode]
        );

        const user = newUser.rows[0];
        user.friendCode = user.friend_code; // Map for frontend
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

// Login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            return res.status(401).json({ success: false, error: 'Şifre hatalı' });
        }

        // Map DB columns to Frontend props
        user.friendCode = user.friend_code;
        user.weddingDate = user.wedding_date;

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Giriş hatası' });
    }
};

// Update User (Settings)
exports.updateUser = async (req, res) => {
    const { username, updates } = req.body;
    try {
        const keys = Object.keys(updates);
        const values = Object.values(updates);

        if (keys.length === 0) return res.json({ success: true });

        const columnMap = {
            weddingDate: 'wedding_date',
            friendCode: 'friend_code',
            title: 'title',
            password: 'password',
            role: 'role',
            username: 'username' // Allow username update
        };

        const setClause = keys.map((key, index) => {
            const dbCol = columnMap[key] || key;
            return `${dbCol} = $${index + 1}`;
        }).join(', ');

        // Check if username is being changed, check uniqueness
        if (updates.username) {
            const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [updates.username]);
            if (userCheck.rows.length > 0 && userCheck.rows[0].username !== username) {
                return res.status(400).json({ success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' });
            }
        }

        await pool.query(`UPDATE users SET ${setClause} WHERE username = $${keys.length + 1}`, [...values, username]);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Güncelleme hatası' });
    }
};

// Get User
exports.getUser = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [req.params.username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            user.weddingDate = user.wedding_date;
            user.friendCode = user.friend_code;
            res.json(user);
        } else {
            res.status(404).json(null);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
};

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        const users = result.rows.map(user => ({
            ...user,
            weddingDate: user.wedding_date,
            friendCode: user.friend_code
        }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// Get User by Friend Code
exports.getUserByFriendCode = async (req, res) => {
    try {
        const { friendCode } = req.params;
        // Case insensitive search
        const result = await pool.query('SELECT * FROM users WHERE UPPER(friend_code) = UPPER($1)', [friendCode]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            user.weddingDate = user.wedding_date;
            user.friendCode = user.friend_code;
            res.json(user);
        } else {
            res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE username = $1', [req.params.username]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Silme hatası' });
    }
};
