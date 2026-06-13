require('dotenv').config();
const { MongoClient } = require('mongodb');

async function createAdmin() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing in .env');
        process.exit(1);
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('ogea');
        
        const adminData = {
            name: 'OGEA Admin',
            email: 'outreachdhdc@gmail.com',
            password: 'outreachdhdc202', // In a real app we'd hash this, but matching existing hardcode for now
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        // Check if admin already exists
        const existing = await db.collection('users').findOne({ email: adminData.email });
        if (existing) {
            console.log('✅ Admin user already exists in the database.');
            
            // Update password just in case
            await db.collection('users').updateOne(
                { email: adminData.email },
                { $set: { password: adminData.password, role: 'admin' } }
            );
            console.log('✅ Admin password/role ensured.');
        } else {
            await db.collection('users').insertOne(adminData);
            console.log('✅ Admin user successfully created in the database!');
        }

    } catch (err) {
        console.error('❌ Error creating admin:', err);
    } finally {
        await client.close();
        process.exit(0);
    }
}

createAdmin();
