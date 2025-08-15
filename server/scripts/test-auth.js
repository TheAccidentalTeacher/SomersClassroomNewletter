/**
 * Authentication System Test Script
 * Professional test script to verify Phase 1 authentication implementation
 */

require('dotenv').config();
const axios = require('axios');
const { DatabaseManager } = require('../config/database');
const logger = require('../utils/logger');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test user data
const testUser = {
    email: 'test.teacher@school.edu',
    password: 'TestPassword123!',
    displayName: 'Test Teacher',
    school: 'Test Elementary School',
    subjects: ['Math', 'Science'],
    gradeLevels: ['3rd Grade', '4th Grade']
};

const adminUser = {
    email: 'mr.somers@school.edu',
    password: 'admin123'
};

class AuthTester {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.testUserId = null;
    }

    async makeRequest(method, endpoint, data = null, token = null) {
        try {
            const config = {
                method,
                url: `${API_URL}${endpoint}`,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return { success: true, data: response.data, status: response.status };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            };
        }
    }

    async testHealthCheck() {
        logger.info('🏥 Testing health check endpoint...');
        
        const result = await this.makeRequest('GET', '/health');
        
        if (result.success) {
            logger.info('✅ Health check passed:', result.data);
            return true;
        } else {
            logger.error('❌ Health check failed:', result.error);
            return false;
        }
    }

    async testUserRegistration() {
        logger.info('📝 Testing user registration...');
        
        const result = await this.makeRequest('POST', '/auth/register', testUser);
        
        if (result.success) {
            logger.info('✅ User registration successful');
            this.accessToken = result.data.data.accessToken;
            this.refreshToken = result.data.data.refreshToken;
            this.testUserId = result.data.data.user.id;
            logger.info('🔑 Tokens received and stored');
            return true;
        } else {
            if (result.error.code === 'USER_EXISTS') {
                logger.warn('⚠️  User already exists, proceeding to login test');
                return true;
            } else {
                logger.error('❌ User registration failed:', result.error);
                return false;
            }
        }
    }

    async testUserLogin() {
        logger.info('🔐 Testing user login...');
        
        const loginData = {
            email: testUser.email,
            password: testUser.password
        };
        
        const result = await this.makeRequest('POST', '/auth/login', loginData);
        
        if (result.success) {
            logger.info('✅ User login successful');
            this.accessToken = result.data.data.accessToken;
            this.refreshToken = result.data.data.refreshToken;
            this.testUserId = result.data.data.user.id;
            return true;
        } else {
            logger.error('❌ User login failed:', result.error);
            return false;
        }
    }

    async testProtectedEndpoint() {
        logger.info('🛡️  Testing protected endpoint access...');
        
        const result = await this.makeRequest('GET', '/auth/me', null, this.accessToken);
        
        if (result.success) {
            logger.info('✅ Protected endpoint access successful');
            logger.info('👤 User profile:', {
                email: result.data.data.user.email,
                displayName: result.data.data.user.displayName,
                isAdmin: result.data.data.user.isAdmin
            });
            return true;
        } else {
            logger.error('❌ Protected endpoint access failed:', result.error);
            return false;
        }
    }

    async testTokenRefresh() {
        logger.info('🔄 Testing token refresh...');
        
        const refreshData = {
            refreshToken: this.refreshToken
        };
        
        const result = await this.makeRequest('POST', '/auth/refresh', refreshData);
        
        if (result.success) {
            logger.info('✅ Token refresh successful');
            this.accessToken = result.data.data.accessToken;
            return true;
        } else {
            logger.error('❌ Token refresh failed:', result.error);
            return false;
        }
    }

    async testProfileUpdate() {
        logger.info('📝 Testing profile update...');
        
        const updateData = {
            displayName: 'Updated Test Teacher',
            school: 'Updated Elementary School',
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };
        
        const result = await this.makeRequest('PUT', '/auth/profile', updateData, this.accessToken);
        
        if (result.success) {
            logger.info('✅ Profile update successful');
            logger.info('📋 Updated profile:', {
                displayName: result.data.data.user.displayName,
                school: result.data.data.user.school
            });
            return true;
        } else {
            logger.error('❌ Profile update failed:', result.error);
            return false;
        }
    }

    async testSessionManagement() {
        logger.info('📱 Testing session management...');
        
        // Get active sessions
        const sessionsResult = await this.makeRequest('GET', '/auth/sessions', null, this.accessToken);
        
        if (sessionsResult.success) {
            logger.info('✅ Session retrieval successful');
            const sessions = sessionsResult.data.data.sessions;
            logger.info(`📊 Active sessions: ${sessions.length}`);
            
            if (sessions.length > 0) {
                logger.info('🖥️  Sample session:', {
                    id: sessions[0].id,
                    deviceInfo: sessions[0].deviceInfo?.userAgent?.substring(0, 50) + '...',
                    createdAt: sessions[0].createdAt
                });
            }
            
            return true;
        } else {
            logger.error('❌ Session management test failed:', result.error);
            return false;
        }
    }

    async testAdminLogin() {
        logger.info('👑 Testing admin login...');
        
        const result = await this.makeRequest('POST', '/auth/login', adminUser);
        
        if (result.success) {
            logger.info('✅ Admin login successful');
            logger.info('👑 Admin user:', {
                email: result.data.data.user.email,
                displayName: result.data.data.user.displayName,
                isAdmin: result.data.data.user.isAdmin
            });
            return true;
        } else {
            logger.error('❌ Admin login failed:', result.error);
            return false;
        }
    }

    async testLogout() {
        logger.info('🚪 Testing user logout...');
        
        const logoutData = {
            refreshToken: this.refreshToken
        };
        
        const result = await this.makeRequest('POST', '/auth/logout', logoutData);
        
        if (result.success) {
            logger.info('✅ Logout successful');
            this.accessToken = null;
            this.refreshToken = null;
            return true;
        } else {
            logger.error('❌ Logout failed:', result.error);
            return false;
        }
    }

    async testInvalidToken() {
        logger.info('🚫 Testing invalid token handling...');
        
        const result = await this.makeRequest('GET', '/auth/me', null, 'invalid-token');
        
        if (!result.success && result.status === 401) {
            logger.info('✅ Invalid token properly rejected');
            return true;
        } else {
            logger.error('❌ Invalid token test failed - should have been rejected');
            return false;
        }
    }

    async runAllTests() {
        logger.info('🚀 Starting comprehensive authentication tests...');
        console.log('\n='.repeat(60));
        console.log('🧪 Newsletter Generator - Authentication System Tests');
        console.log('='.repeat(60));
        
        const tests = [
            { name: 'Health Check', fn: () => this.testHealthCheck() },
            { name: 'User Registration', fn: () => this.testUserRegistration() },
            { name: 'User Login', fn: () => this.testUserLogin() },
            { name: 'Protected Endpoint', fn: () => this.testProtectedEndpoint() },
            { name: 'Token Refresh', fn: () => this.testTokenRefresh() },
            { name: 'Profile Update', fn: () => this.testProfileUpdate() },
            { name: 'Session Management', fn: () => this.testSessionManagement() },
            { name: 'Admin Login', fn: () => this.testAdminLogin() },
            { name: 'Invalid Token Handling', fn: () => this.testInvalidToken() },
            { name: 'User Logout', fn: () => this.testLogout() }
        ];
        
        let passed = 0;
        let failed = 0;
        
        for (const test of tests) {
            try {
                console.log(`\n📋 Running: ${test.name}`);
                const result = await test.fn();
                
                if (result) {
                    passed++;
                } else {
                    failed++;
                }
                
                // Brief pause between tests
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                logger.error(`💥 Test "${test.name}" crashed:`, error);
                failed++;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Phase 1 authentication system is working correctly.');
            console.log('\n📋 Phase 1 Complete - Ready for Phase 2 Implementation');
            return true;
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.');
            return false;
        }
    }
}

async function main() {
    try {
        // Check if database is initialized
        const db = DatabaseManager.getInstance();
        const isHealthy = await db.healthCheck();
        
        if (!isHealthy) {
            console.error('❌ Database connection failed. Please run "npm run init-db" first.');
            process.exit(1);
        }
        
        const tester = new AuthTester();
        const success = await tester.runAllTests();
        
        process.exit(success ? 0 : 1);
        
    } catch (error) {
        logger.error('Test execution failed:', error);
        console.error('\n💥 Test execution failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('  1. Ensure the server is running (npm run dev)');
        console.error('  2. Verify database is initialized (npm run init-db)');
        console.error('  3. Check all environment variables are set');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = AuthTester;
