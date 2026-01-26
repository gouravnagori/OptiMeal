import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    try {
        console.log('--- Testing Manager Registration ---');
        const managerData = {
            name: 'Test Manager',
            email: `manager_${Date.now()}@test.com`,
            password: 'password123',
            role: 'manager',
            messName: 'Test Mess',
            messCode: `MESS_${Date.now()}`,
            location: 'Test City',
            phone: '1234567890'
        };

        const managerRes = await axios.post(`${API_URL}/register`, managerData);
        console.log('Manager Registered:', managerRes.data);
        const messCode = managerData.messCode;

        console.log('\n--- Testing Student Registration ---');
        const studentData = {
            name: 'Test Student',
            email: `student_${Date.now()}@test.com`,
            password: 'password123',
            role: 'student',
            messCode: messCode,
            phone: '0987654321'
        };

        const studentRes = await axios.post(`${API_URL}/register`, studentData);
        console.log('Student Registered:', studentRes.data);

        console.log('\n--- Testing Student Login ---');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: studentData.email,
            password: studentData.password
        });
        console.log('Student Logged In:', loginRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testAuth();
