import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Seed users with different roles for testing
const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@portal.com',
    password: 'Admin123!',
    role: 'Admin',
    contact_info: '1234567890',
    expertise: null,
  },
  {
    name: 'Staff Plumber',
    email: 'staff@portal.com',
    password: 'Staff123!',
    role: 'Staff',
    contact_info: '2345678901',
    expertise: 'Plumbing',
  },
  {
    name: 'Staff Electrician',
    email: 'electrician@portal.com',
    password: 'Staff123!',
    role: 'Staff',
    contact_info: '3456789012',
    expertise: 'Electrical',
  },
  {
    name: 'Staff IT Support',
    email: 'itsupport@portal.com',
    password: 'Staff123!',
    role: 'Staff',
    contact_info: '4567890123',
    expertise: 'IT',
  },
  {
    name: 'Regular User',
    email: 'user@portal.com',
    password: 'User123!',
    role: 'User',
    contact_info: '5678901234',
    expertise: null,
  },
  {
    name: 'John Resident',
    email: 'john@example.com',
    password: 'User123!',
    role: 'User',
    contact_info: '6789012345',
    expertise: null,
  },
];

// Sample complaints for demo
const seedComplaints = [
  {
    user_id: 5, // Regular User
    title: 'Water leaking from ceiling',
    description: 'There is water dripping from the ceiling in my room. It started after last night\'s rain.',
    category: 'Plumbing',
    priority: 'High',
    location: 'Room 201, Building A',
    status: 'Open',
  },
  {
    user_id: 5,
    title: 'Power outlet not working',
    description: 'The power outlet near my desk stopped working yesterday. I cannot charge my laptop.',
    category: 'Electrical',
    priority: 'Medium',
    location: 'Room 201, Building A',
    status: 'Assigned',
    staff_id: 3, // Electrician
  },
  {
    user_id: 6, // John
    title: 'AC not cooling properly',
    description: 'The air conditioner is running but not cooling the room. Temperature stays at 30°C.',
    category: 'Facility',
    priority: 'High',
    location: 'Room 305, Building B',
    status: 'In-progress',
    staff_id: 2, // Plumber (generic facility)
  },
  {
    user_id: 6,
    title: 'WiFi connection issues',
    description: 'Internet is very slow and keeps disconnecting every few minutes.',
    category: 'IT',
    priority: 'Medium',
    location: 'Common Area, Building B',
    status: 'Resolved',
    staff_id: 4, // IT Support
  },
  {
    user_id: 5,
    title: 'Broken door handle',
    description: 'The door handle to my room is loose and might fall off. Needs urgent repair.',
    category: 'Facility',
    priority: 'Low',
    location: 'Room 201, Building A',
    status: 'Open',
  },
];

// SLA hours by priority
const SLA_HOURS: Record<string, number> = {
  Critical: 4,
  High: 12,
  Medium: 24,
  Low: 48,
};

async function seedDatabase() {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'complaint_portal',
    });

    console.log('Connected to database');

    // Clear existing data (for re-seeding)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE refresh_tokens');
    await connection.query('TRUNCATE TABLE comments');
    await connection.query('TRUNCATE TABLE audit_logs');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE feedback');
    await connection.query('TRUNCATE TABLE status_history');
    await connection.query('TRUNCATE TABLE complaints');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleared existing data');

    // Insert users with hashed passwords
    for (const user of seedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.query(
        `INSERT INTO users (name, email, password, role, contact_info, expertise) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, hashedPassword, user.role, user.contact_info, user.expertise]
      );
    }
    console.log(`Inserted ${seedUsers.length} users`);

    // Insert complaints with SLA deadlines
    for (const complaint of seedComplaints) {
      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + SLA_HOURS[complaint.priority]);

      const resolvedAt = complaint.status === 'Resolved' ? new Date() : null;

      await connection.query(
        `INSERT INTO complaints 
         (user_id, staff_id, title, description, category, priority, location, status, sla_deadline, resolved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          complaint.user_id,
          complaint.staff_id || null,
          complaint.title,
          complaint.description,
          complaint.category,
          complaint.priority,
          complaint.location,
          complaint.status,
          slaDeadline,
          resolvedAt,
        ]
      );
    }
    console.log(`Inserted ${seedComplaints.length} complaints`);

    // Add status history for assigned and resolved complaints
    await connection.query(
      `INSERT INTO status_history (complaint_id, previous_status, new_status, updated_by, notes)
       VALUES 
       (2, 'Open', 'Assigned', 1, 'Assigned to electrician for review'),
       (3, 'Open', 'Assigned', 1, 'Assigned to facility staff'),
       (3, 'Assigned', 'In-progress', 2, 'Started working on AC unit'),
       (4, 'Open', 'Assigned', 1, 'Assigned to IT support'),
       (4, 'Assigned', 'In-progress', 4, 'Checking network configuration'),
       (4, 'In-progress', 'Resolved', 4, 'Router reset and firmware updated. Issue resolved.')`
    );
    console.log('Inserted status history');

    // Add sample feedback for resolved complaint
    await connection.query(
      `INSERT INTO feedback (complaint_id, rating, review, is_resolved)
       VALUES (4, 5, 'Quick response and the issue was fixed. Great service!', TRUE)`
    );
    console.log('Inserted sample feedback');

    // Add sample notifications
    await connection.query(
      `INSERT INTO notifications (user_id, complaint_id, type, message)
       VALUES 
       (5, 2, 'Assigned', 'Your complaint has been assigned to a technician.'),
       (5, 4, 'Resolved', 'Your complaint about WiFi has been resolved.'),
       (3, 2, 'Assigned', 'New complaint assigned to you: Power outlet not working'),
       (4, 4, 'FeedbackRequest', 'Please rate the service for your resolved complaint.')`
    );
    console.log('Inserted sample notifications');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('  Admin: admin@portal.com / Admin123!');
    console.log('  Staff: staff@portal.com / Staff123!');
    console.log('  User:  user@portal.com / User123!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
