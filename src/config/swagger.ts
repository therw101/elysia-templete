import { swagger } from '@elysiajs/swagger';
import { appConfig } from './database';

export const swaggerConfig = swagger({
  documentation: {
    info: {
      title: appConfig.name,
      version: appConfig.version,
      description: `
${appConfig.description}

## 🚀 Features
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin, Employer, Student roles
- **Job Management** - Complete CRUD operations for part-time jobs
- **Advanced Search & Filtering** - Find jobs by category, location, salary range
- **File Upload Support** - Profile images and documents
- **Real-time Validation** - Type-safe request/response handling

## 🔐 Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer your-jwt-token-here
\`\`\`

## 📝 Response Format
All API responses follow this consistent format:
\`\`\`json
{
  "success": boolean,
  "data": any,
  "message": string,
  "errors": string[]
}
\`\`\`
      `,
      contact: {
        name: 'RMU Development Team',
        email: 'dev@rmu.ac.th'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Jobs',
        description: 'Part-time job management endpoints'
      },
      {
        name: 'Applications',
        description: 'Job application management endpoints'
      },
      {
        name: 'Users',
        description: 'User profile management endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (Admin only)'
      },
      {
        name: 'Health',
        description: 'System health and status endpoints'
      }
    ],
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.rmu-parttime.com'
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production'
          ? 'Production Server'
          : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            data: {
              description: 'Response data (varies by endpoint)'
            },
            message: {
              type: 'string',
              description: 'Human-readable message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of error messages (if any)'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              description: 'Unique username'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            role: {
              type: 'string',
              enum: ['admin', 'employer', 'student'],
              description: 'User role'
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number'
            },
            profileImage: {
              type: 'string',
              description: 'Profile image URL'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Job: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique job identifier'
            },
            title: {
              type: 'string',
              description: 'Job title'
            },
            description: {
              type: 'string',
              description: 'Detailed job description'
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Job requirements list'
            },
            salary: {
              type: 'number',
              description: 'Salary amount'
            },
            salaryType: {
              type: 'string',
              enum: ['hourly', 'daily', 'weekly', 'monthly'],
              description: 'Salary payment type'
            },
            location: {
              type: 'string',
              description: 'Job location'
            },
            category: {
              type: 'string',
              enum: ['food_service', 'retail', 'tutoring', 'office_work', 'event_staff', 'delivery', 'other'],
              description: 'Job category'
            },
            workingHours: {
              type: 'object',
              description: 'Weekly working hours schedule',
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    startTime: {
                      type: 'string',
                      pattern: '^\\d{2}:\\d{2}$',
                      description: 'Start time (HH:mm format)'
                    },
                    endTime: {
                      type: 'string',
                      pattern: '^\\d{2}:\\d{2}$',
                      description: 'End time (HH:mm format)'
                    }
                  }
                }
              }
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Job start date'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Job end date (optional)'
            },
            maxApplicants: {
              type: 'number',
              description: 'Maximum number of applicants'
            },
            currentApplicants: {
              type: 'number',
              description: 'Current number of applicants'
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'paused', 'expired', 'closed'],
              description: 'Job status'
            },
            employerId: {
              type: 'string',
              description: 'ID of the employer who posted the job'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Job creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Email is required', 'Password must be at least 6 characters']
            }
          }
        },
        UnauthorizedError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Authentication required'
            }
          }
        },
        ForbiddenError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Insufficient permissions'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  exclude: ['/docs', '/docs/json'],
  path: '/docs'
}); 