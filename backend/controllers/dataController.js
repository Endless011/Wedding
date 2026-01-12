const pool = require('../db');

// Helper: Generate ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Get All Data
exports.getAllData = async (req, res) => {
    const { userId } = req.params;

    try {
        const userRes = await pool.query('SELECT id FROM users WHERE username = $1', [userId]);
        if (userRes.rows.length === 0) return res.json([]);
        const dbUserId = userRes.rows[0].id;

        // Fetch Groups
        const groupsRes = await pool.query('SELECT * FROM groups WHERE user_id = $1 ORDER BY created_at', [dbUserId]);
        const groups = groupsRes.rows;

        for (let group of groups) {
            // Fetch Categories
            const catsRes = await pool.query('SELECT * FROM categories WHERE group_id = $1 ORDER BY created_at', [group.id]);
            group.categories = catsRes.rows;

            group.targetQuantity = group.target_quantity;

            for (let cat of group.categories) {
                cat.targetQuantity = cat.target_quantity;
                cat.isCompleted = cat.is_completed;

                // Fetch Products
                const prodsRes = await pool.query('SELECT * FROM products WHERE category_id = $1 ORDER BY created_at', [cat.id]);
                cat.products = prodsRes.rows.map(p => ({
                    ...p,
                    purchasedQuantity: p.purchased_quantity,
                    isPurchased: p.is_purchased
                }));
            }
        }

        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Data fetch error' });
    }
};

// --- GROUPS ---

exports.addGroup = async (req, res) => {
    const { userId, group } = req.body;
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE username = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const dbUserId = userRes.rows[0].id;

        const newId = generateId();
        await pool.query(
            'INSERT INTO groups (id, user_id, name, icon, color) VALUES ($1, $2, $3, $4, $5)',
            [newId, dbUserId, group.name, group.icon, group.color]
        );
        res.json({ id: newId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Add group error' });
    }
};

exports.addGroupWithHierarchy = async (req, res) => {
    const { userId, group } = req.body; // group includes categories -> products
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get User ID
        const userRes = await client.query('SELECT id FROM users WHERE username = $1', [userId]);
        if (userRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }
        const dbUserId = userRes.rows[0].id;

        // 2. Create Group
        const groupId = generateId();
        await client.query(
            'INSERT INTO groups (id, user_id, name, icon, color) VALUES ($1, $2, $3, $4, $5)',
            [groupId, dbUserId, group.name, group.icon, group.color]
        );

        // 3. Categories & Products
        if (group.categories && group.categories.length > 0) {
            for (const cat of group.categories) {
                const catId = generateId();
                await client.query(
                    'INSERT INTO categories (id, group_id, name, description, target_quantity, is_completed) VALUES ($1, $2, $3, $4, $5, $6)',
                    [catId, groupId, cat.name, cat.description || '', cat.targetQuantity || 1, false]
                );

                if (cat.products && cat.products.length > 0) {
                    for (const prod of cat.products) {
                        const prodId = generateId();
                        await client.query(
                            'INSERT INTO products (id, category_id, name, brand, price, purchased_quantity, notes, is_purchased) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                            [prodId, catId, prod.name, prod.brand || '', prod.price || 0, 0, prod.notes || '', false]
                        );
                    }
                }
            }
        }

        await client.query('COMMIT');
        res.json({ id: groupId, success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Add hierarchy error:', error);
        res.status(500).json({ error: 'Failed to add group package' });
    } finally {
        client.release();
    }
};

exports.updateGroup = async (req, res) => {
    const { updates } = req.body;
    try {
        const { name, icon, color } = updates;
        await pool.query(
            'UPDATE groups SET name = COALESCE($1, name), icon = COALESCE($2, icon), color = COALESCE($3, color) WHERE id = $4',
            [name, icon, color, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update group error' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        await pool.query('DELETE FROM groups WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete group error' });
    }
};

// --- CATEGORIES ---

exports.addCategory = async (req, res) => {
    const { groupId, category } = req.body;
    try {
        const newId = generateId();
        await pool.query(
            'INSERT INTO categories (id, group_id, name, description, target_quantity, is_completed) VALUES ($1, $2, $3, $4, $5, $6)',
            [newId, groupId, category.name, category.description, category.targetQuantity, category.isCompleted || false]
        );
        res.json({ id: newId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Add category error' });
    }
};

exports.updateCategory = async (req, res) => {
    const { updates } = req.body;
    try {
        const { name, description, targetQuantity, isCompleted } = updates;
        await pool.query(
            `UPDATE categories SET 
                name = COALESCE($1, name), 
                description = COALESCE($2, description), 
                target_quantity = COALESCE($3, target_quantity),
                is_completed = COALESCE($4, is_completed)
             WHERE id = $5`,
            [name, description, targetQuantity, isCompleted, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update category error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete category error' });
    }
};

// --- PRODUCTS ---

exports.addProduct = async (req, res) => {
    const { categoryId, product } = req.body;
    try {
        const newId = generateId();
        await pool.query(
            'INSERT INTO products (id, category_id, name, brand, price, purchased_quantity, notes, is_purchased) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [newId, categoryId, product.name, product.brand, product.price, product.purchasedQuantity || 0, product.notes, product.isPurchased || false]
        );
        res.json({ id: newId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Add product error' });
    }
};

exports.updateProduct = async (req, res) => {
    const { updates } = req.body;
    try {
        const { name, brand, price, purchasedQuantity, notes, isPurchased } = updates;
        await pool.query(
            `UPDATE products SET 
                name = COALESCE($1, name), 
                brand = COALESCE($2, brand), 
                price = COALESCE($3, price),
                purchased_quantity = COALESCE($4, purchased_quantity),
                notes = COALESCE($5, notes),
                is_purchased = COALESCE($6, is_purchased)
             WHERE id = $7`,
            [name, brand, price, purchasedQuantity, notes, isPurchased, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update product error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete product error' });
    }
};
